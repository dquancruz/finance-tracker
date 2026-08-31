# syntax=docker/dockerfile:1

# Multi-stage build for apps/api using `turbo prune` to isolate this
# workspace's dependency graph (@finance-tracker/api + shared + finance-utils)
# from the rest of the monorepo. Build context = repo root; Railway is
# pointed at this file with Root Directory left at the repo root.
# See docs/deployment/railway.md Option B.

FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo@^2.3.3
COPY . .
RUN turbo prune --scope=@finance-tracker/api --docker

FROM node:20-slim AS installer
WORKDIR /app
# argon2 ships native bindings compiled via node-gyp during `npm ci`; slim
# images omit Python and a C++ toolchain, so installs fail without these.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
ENV PYTHON=/usr/bin/python3
COPY --from=pruner /app/out/json/ .
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
# turbo prune's pruned output doesn't carry root-level config files that
# aren't part of the workspace package graph — packages/shared and
# packages/finance-utils both `extends` this.
COPY --from=pruner /app/tsconfig.base.json ./tsconfig.base.json
RUN npx turbo run build --filter=@finance-tracker/api...

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
