# Finance Tracker

> Aplicación de seguimiento de finanzas personales — web-first, escalable a mobile (iOS/Android).

## Tech Stack
- Runtime: Node.js 20
- Monorepo: Turborepo (`apps/web`, `apps/api`, `packages/shared`, `packages/finance-utils`, `packages/ui`)
- Web: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui
- API: NestJS + TypeScript + Socket.io (WebSockets)
- Base de datos: MongoDB Atlas + Mongoose (discriminator pattern para tipos de gasto)
- Auth web: NextAuth.js v5 (credentials + Google OAuth)
- Auth API: Passport JWT + argon2id
- Charts: Recharts
- Testing: Jest (API) + Vitest (web) + Playwright (E2E)
- Deploy: Vercel (web) + Railway (API) + MongoDB Atlas

## Comandos
- Build:       `npm run build`        → `turbo run build`
- Test:        `npm test`             → `turbo run test`
- Lint:        `npm run lint`         → `turbo run lint`
- Type check:  `npm run type-check`   → `turbo run type-check`
- Dev:         `npm run dev`          → `turbo run dev`
- Auto-commit: `npm run auto-commit -- --help`
- Auto-PR:     `npm run auto-pr -- --help`

## Arquitectura

```
finance-tracker/
├── apps/
│   ├── web/              → Next.js 15 (src/app/, components/, hooks/, lib/)
│   └── api/              → NestJS (src/auth/, users/, categories/, expenses/, analytics/, realtime/)
├── packages/
│   ├── shared/           → Tipos TypeScript + Zod schemas (IUser, ICategory, IExpense, analytics)
│   ├── finance-utils/    → Lógica financiera pura: interés, amortización, recurrencia
│   └── ui/               → shadcn/ui re-exportados como workspace package
└── scripts/              → auto-commit.js, auto-pr.js, auto-jira.js, dashboard.js
```

## Tipos de Gasto (Modelo Core)
- **Simple**: pago único (amount, date, category)
- **Recurring**: suscripción (amount, frequency, nextDueDate, isActive)
- **Installment**: cuota/préstamo (totalAmount, numInstallments, interestRate, interestType: none|simple|compound, paymentSchedule[])

## Convenciones
- Server Components por defecto en Next.js; `'use client'` solo cuando sea necesario
- Soft deletes — nunca borrar físicamente (`deletedAt` en lugar de DELETE)
- Todos los modelos tienen `createdAt`, `updatedAt`, `deletedAt?`
- Discriminador Mongoose `__t` para tipos de gasto en una sola colección
- Cursor-based pagination (cursor = last `_id`) en `GET /api/expenses`
- Conventional Commits (ver skill `semantic-versioning`)
- Sin `any` explícitos — TypeScript strict mode

## Real-time (Socket.io)
- Auth en handshake: `socket.auth.token` (JWT Bearer)
- Cada usuario se une a room `user:{userId}`
- Eventos clave: `expense:created`, `expense:updated`, `expense:deleted`, `installment:paid`, `analytics:refresh` (debounced 500ms), `budget:alert`, `recurring:due_soon`

## Variables de Entorno (`.env.local`)
```
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
GITHUB_TOKEN=
GITHUB_OWNER=dquancruz
GITHUB_REPO=finance-tracker
GIT_AUTHOR_NAME=Daniel Quan
GIT_AUTHOR_EMAIL=danielquan.c@gmail.com
```

## Workflow de agentes (Claude Code)
Los subagentes residen en `~/.claude/agents/`. En otras herramientas, replicar el flujo manualmente siguiendo el árbol de decisión abajo.

### Árbol de decisión: cuándo usar cuál agente
```
¿Qué necesitas?
- Diseñar arquitectura / decidir el enfoque   → solutions-expert
- Generar jerarquía de tickets Jira           → ticket-orchestrator
- Backend API (NestJS/MongoDB)                → backend-expert
- Frontend (Next.js + a11y + diseño)          → frontend-expert
- Arquitectura AWS                            → aws-architect
- Infra as Code (CDK)                         → cdk-expert
- Crear PR (formato TELUS)                    → pr-manager
- Review general + scanning ligero            → code-reviewer-pro
- Seguridad profunda (auth/crypto/IAM)        → security-expert
- Docs + versionado + releases                → documentation-generator
- Orquestar varios de los anteriores          → agent-orchestrator
```

Pipeline típico: solutions-expert → (backend|frontend) → code-reviewer-pro → pr-manager.

## Reglas críticas
- NUNCA hacer push directo a `main`.
- NUNCA commitear `.env.local` ni secretos.
- SIEMPRE correr lint + tests antes de un PR.
- Scope acotado: investigaciones >50 archivos → spawn de subagente, no en el contexto principal.
