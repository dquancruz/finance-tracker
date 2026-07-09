# Production MongoDB Atlas configuration

Status: connection-level hardening implemented in `apps/api/src/app.module.ts`
+ `apps/api/src/config/env.validation.ts` (Phase 5). Atlas dashboard-side
setup (cluster tier, network access, backups) is still an infra/ops task, not
code — this doc covers both what's already in the codebase and what's left to
configure in the Atlas project itself.

## 1. Connection string

`MONGODB_URI` must be an SRV connection string
(`mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority`,
see `apps/api/.env.example`). `env.validation.ts` rejects anything that
doesn't start with `mongodb://` or `mongodb+srv://` at boot, so a malformed
URI fails fast instead of the API starting and only breaking on the first
query.

Use a **dedicated, least-privilege Atlas database user** scoped to
read/write on the `finance-tracker` database only — not an Atlas admin user.

## 2. Connection resiliency & pool sizing (implemented)

`MongooseModule.forRootAsync` in `app.module.ts` now sets:

| Option | Value | Why |
|---|---|---|
| `retryWrites` | `true` | Atlas performs rolling maintenance/failovers; retries transient write errors transparently instead of surfacing them to the request. |
| `retryReads` | `true` | Same, for reads. |
| `maxPoolSize` | 20 (production) / 10 (otherwise) | Bounds how many concurrent connections one API instance opens to Atlas — Atlas cluster tiers cap total connections (e.g. M10 ≈ 1500), and an unbounded pool across multiple Railway replicas can exhaust that budget. Revisit if/when the API scales to multiple replicas (total = replicas × maxPoolSize). |
| `minPoolSize` | 1 | Avoids the first request after an idle period paying full connection-establishment latency. |
| `serverSelectionTimeoutMS` | 10000 | Fails fast (10s) if the cluster is unreachable at boot/query time, instead of the Node default (30s) hanging the health check. |
| `autoIndex` | `false` in production, `true` otherwise | Nest/Mongoose normally builds indexes automatically on model registration. In dev that's convenient; in production, an index build takes a collection-level lock and can be slow/disruptive on a populated collection — see §3. |

## 3. Index management in production (`autoIndex: false`)

Because `autoIndex` is off in production, **indexes are not created
automatically** when the API boots against a production Atlas cluster. Run
the new maintenance script once after any deploy that adds/changes a schema
index:

```bash
# from apps/api, with MONGODB_URI/JWT_SECRET/etc. set in the environment
npm run sync-indexes
```

This runs `apps/api/src/scripts/sync-indexes.ts`, which boots a headless
Nest application context (no HTTP listener) and calls `syncIndexes()` on
every registered Mongoose model — safe to re-run; it's a no-op if indexes
already match the schema.

**Immediate action item:** the notification dedupe race-condition fix
(`fix/notification-dedupe-race`) adds a new unique
`(userId, dedupeKey)` index on the `Notification` collection. Whichever of
that PR / this one merges second must run `npm run sync-indexes` against the
production cluster once both are live — otherwise the atomic-upsert dedupe
guard has no unique index backing it and can't actually prevent duplicates.

## 4. Network access (not implemented here — Atlas dashboard config)

See `docs/deployment/railway.md` §4: MVP is Atlas Network Access allowing
`0.0.0.0/0` (Railway has no stable outbound IP on standard plans) relying on
mandatory TLS + the least-privilege DB user above. Static-IP allowlisting is
a paid-plan infra change, tracked as still open.

## 5. Backups (not implemented here — Atlas dashboard config)

Not addressed by this PR. Atlas M10+ tiers include continuous cloud backups
with point-in-time recovery; free/shared (M0/M2/M5) tiers do not. Recommend
moving off a shared tier before this app holds real financial data for real
users — tracked as an open item, not blocking Phase 5 code changes.
