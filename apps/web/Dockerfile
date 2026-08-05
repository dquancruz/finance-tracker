# syntax=docker/dockerfile:1

# Multi-stage build for apps/web using `turbo prune` to isolate this
# workspace's dependency graph (@finance-tracker/web + shared +
# finance-utils) from apps/api. Build context = repo root; Railway is
# pointed at this file with Root Directory left at the repo root.
# Mirrors apps/api/Dockerfile's approach — see docs/deployment/railway.md.

FROM node:20-slim AS pruner
WORKDIR /app
RUN npm install -g turbo@^2.3.3
COPY . .
RUN turbo prune --scope=@finance-tracker/web --docker

FROM node:20-slim AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
# turbo prune's pruned output doesn't carry root-level config files that
# aren't part of the workspace package graph — packages/shared (a build
# dependency of web) `extends` this.
COPY --from=pruner /app/tsconfig.base.json ./tsconfig.base.json
# Next.js inlines NEXT_PUBLIC_* vars into the client bundle at build time —
# these must be build ARGs, not just runtime env vars. Railway's Dockerfile
# builder auto-passes matching service variables as build args.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npx turbo run build --filter=@finance-tracker/web...

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "start"]
