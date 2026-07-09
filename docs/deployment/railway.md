# Deploying `apps/api` to Railway

Status: **planning document — nothing in this file has been deployed or provisioned.**
This describes how the NestJS backend (`apps/api`) will be deployed to Railway,
and how that fits with the already-decided Vercel (web) + MongoDB Atlas pieces
(see `AGENTS.md` → "Deploy: Vercel (web) + Railway (API) + MongoDB Atlas").

## 1. Monorepo build strategy (Turborepo)

`apps/api` depends on two workspace packages that must be built first:
`@finance-tracker/shared` and `@finance-tracker/finance-utils` (both compiled
with `tsc` to `dist/`, see `turbo.json`: `build` depends on `^build`).
Railway needs to build **only** `apps/api` and its upstream workspace deps,
not `apps/web` or `packages/ui`.

Two viable approaches — recommend (B) for production, (A) is the fastest path
to a working deployment.

### Option A — Nixpacks, repo root, custom commands (fastest to set up)

Railway's Nixpacks builder auto-detects Node from the root `package.json`
(`"packageManager": "npm@10.9.2"`, `"engines": { "node": ">=20" }`). Keep the
service's **Root Directory at the repo root** (do not point it at `apps/api`
— that breaks npm workspace resolution for `@finance-tracker/shared` /
`@finance-tracker/finance-utils`), and override:

- **Build command:** `npx turbo run build --filter=@finance-tracker/api...`
  (the trailing `...` means "this package + everything it depends on" —
  builds `packages/shared`, `packages/finance-utils`, then `apps/api`, and
  skips `apps/web` / `packages/ui` entirely).
- **Start command:** `node apps/api/dist/main.js`
- **Install command:** leave default (`npm ci`), which installs the full
  workspace — required since `apps/api`'s `node_modules` are hoisted/symlinked
  at the root under npm workspaces.

Trade-off: every deploy installs/builds the whole workspace tree (slower,
larger image), even though only `apps/api`'s output is actually run.

### Option B — Dockerfile with `turbo prune` (recommended for production)

Turborepo's `turbo prune --scope=@finance-tracker/api` generates a minimal
sub-monorepo (just `apps/api` + its workspace deps' `package.json`s and
source) into `out/`, which keeps the image small and the build reproducible.
Sketch of `apps/api/Dockerfile` (not yet created — this is the plan):

```dockerfile
FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@finance-tracker/api --docker

FROM node:20-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@finance-tracker/api...

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
```

Railway builder setting: **Dockerfile** (Root Directory = repo root, since
`turbo prune` needs the full workspace context to compute the dependency
graph; the Dockerfile itself lives at `apps/api/Dockerfile` and Railway is
pointed at that path with build context = repo root).

Either option, Railway's own `PORT` env var must be respected —
`apps/api/src/main.ts` already does this: `await app.listen(process.env.PORT ?? 3000)`.

## 2. Environment variables

Reference: `apps/api/.env.example` (structure only, no real values below).
Set these as Railway service variables (Settings → Variables), not committed
anywhere:

| Variable | Purpose | Notes |
|---|---|---|
| `MONGODB_URI` | Atlas SRV connection string | See §4 for network-access considerations |
| `JWT_SECRET` | Signs/verifies API JWTs (`auth`, `realtime` gateway handshake) | Same secret already used by `AuthModule` and the new `RealtimeModule` (`apps/api/src/realtime/realtime.module.ts`) — Socket.io auth reuses it, no new secret needed |
| `PORT` | HTTP port | Railway injects this automatically; do **not** hardcode it — `main.ts` already falls back to `process.env.PORT` |

Not currently read by any `apps/api` code but reserved per `AGENTS.md`'s
documented env var list (`JWT_REFRESH_SECRET`) — skip unless/until a refresh-token
flow is implemented; don't set unused secrets in Railway.

**Implemented (Phase 5):** `CORS_ORIGIN` (comma-separated list) is now read
in `main.ts` and passed to `enableCors({ origin: [...] })`. `env.validation.ts`
enforces it's set whenever `NODE_ENV=production` (boot fails otherwise — no
silent allow-all in prod). Also new: `THROTTLE_TTL_MS` / `THROTTLE_LIMIT`
(global rate limiting defaults, see §8) and `NODE_ENV` itself (must be set to
`production` on Railway — used for both the CORS gate above and the Mongo
connection pool sizing in §4).

## 3. Health check endpoint

Added in this PR: `GET /health` (`apps/api/src/app.controller.ts`), returns
`{ status: 'ok', timestamp: <ISO string> }`. Point Railway's health check at
this path (Settings → Healthcheck Path = `/health`) instead of `/`, so
deploys aren't gated on auth/DB-dependent routes. Railway will hold traffic
from a new deploy until this returns 2xx, giving zero-downtime rollout.

## 4. MongoDB Atlas network access from Railway

Railway does not provide a stable outbound IP on standard service plans —
containers can get a different egress IP per deploy/restart. Two options:

- **MVP (recommended to start):** Atlas Network Access → allow `0.0.0.0/0`
  (all IPs), relying on the SRV connection string's mandatory TLS plus a
  dedicated, least-privilege Atlas database user (read/write scoped to the
  `finance-tracker` database only, not an Atlas admin user) for security.
  This is the standard guidance for PaaS platforms without static egress
  (Railway, most of Vercel/Render's free tiers, etc.).
- **Hardened (Phase 5 candidate, still open):** Railway's "TCP Proxy" /
  static outbound IP add-on (Pro plan) gives a fixed egress IP that can be
  allowlisted explicitly in Atlas Network Access instead of `0.0.0.0/0`.
  Requires a paid Railway plan change + Atlas dashboard config — infra work,
  not code, so it's still open after this PR. Everything else under
  "Production MongoDB Atlas configuration" (connection resiliency, pool
  sizing, index management) is covered in `docs/deployment/mongodb-atlas.md`.

## 5. Socket.io / WebSocket proxy considerations

- Railway's edge proxy terminates TLS and supports HTTP/1.1 Upgrade
  (WebSocket) on the public domain out of the box — no extra Railway config
  needed for `RealtimeGateway` (`apps/api/src/realtime/realtime.gateway.ts`)
  to work over `wss://`.
- Nest's default `@nestjs/platform-socket.io` adapter is used automatically
  (no `useWebSocketAdapter` call needed since `@nestjs/platform-socket.io` is
  already a dependency) — Socket.io's own `/socket.io/` path is served on the
  same HTTP server/port as the REST API, so nothing extra to expose.
- **Single-instance assumption:** `RealtimeGateway` keeps per-user room
  membership and the `analytics:refresh` debounce timers in-process (a plain
  `Map`). This is correct for Railway's default single replica. If/when this
  service is scaled to multiple replicas, add the `@socket.io/redis-adapter`
  (backed by a Railway Redis plugin) so room broadcasts fan out across
  instances — flagging this now, not needed for the current single-instance
  deployment.
- Client-side `NEXT_PUBLIC_WS_URL` (see §6) should point at the same Railway
  domain as `NEXT_PUBLIC_API_URL` — one Nest HTTP server serves both.

## 6. Wiring the deployed API URL into Vercel

Once Railway assigns a domain (either the generated
`*.up.railway.app` domain or a custom domain), set on the **Vercel** project
(`apps/web`), scoped per environment (Production/Preview):

- `NEXT_PUBLIC_API_URL` → `https://<railway-domain>` (used by
  `apps/web/src/lib/api-client.ts` and `apps/web/src/lib/auth.ts`'s
  credentials-login fetch to `${NEXT_PUBLIC_API_URL}/auth/login`)
- `NEXT_PUBLIC_WS_URL` → same Railway domain (used by
  `apps/web/src/lib/socket.ts` for the Socket.io client connection)
- `NEXTAUTH_URL` → the Vercel deployment's own URL (unchanged by this work,
  listed here for completeness since it's in the same env var group)

And on the **Railway** side, set `CORS_ORIGIN` (§2) to the Vercel production
domain (and preview-deployment wildcard if previews need to hit the live
API). Also update the Google OAuth "Authorized redirect URIs" if the Vercel
domain changes from what's currently configured.

## 8. Rate limiting

`AppModule` now registers `ThrottlerModule` globally (`@nestjs/throttler` +
`ThrottlerGuard` as an `APP_GUARD`) — every route is limited to
`THROTTLE_LIMIT` requests per `THROTTLE_TTL_MS` window by default (100 req /
60s), tracked per client IP. `AuthController`'s `login`/`register` endpoints
override this with a much tighter limit (5 req/min) since they're the
highest-value brute-force/signup-spam target. No Railway-specific config
needed — this runs entirely in the Node process. If the API ever scales to
multiple Railway replicas, the in-memory throttler storage becomes
per-instance (each replica gets its own 5-req budget); switch to
`@nestjs/throttler`'s Redis storage adapter at that point.

## 9. Open items / explicitly out of scope here

- No Railway project/service has been created — this is a plan only.
- `apps/api/Dockerfile` (Option B) does not exist yet; Option A requires no
  new files, just Railway dashboard settings.
- Redis-backed Socket.io adapter is not implemented — only relevant once
  scaling beyond one Railway replica.
- Atlas static-IP allowlisting is deferred — infra/billing change, not code
  (see §4).
- Redis-backed throttler storage is deferred — only relevant once scaling
  beyond one Railway replica (see §8).
