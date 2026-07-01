# Finance Tracker

> Personal finance tracking application — web-first, scalable to mobile (iOS/Android).

## Tech Stack
- Runtime: Node.js 20
- Monorepo: Turborepo (`apps/web`, `apps/api`, `packages/shared`, `packages/finance-utils`, `packages/ui`)
- Web: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui
- API: NestJS + TypeScript + Socket.io (WebSockets)
- Database: MongoDB Atlas + Mongoose (discriminator pattern for expense types)
- Web auth: NextAuth.js v5 (credentials + Google OAuth)
- API auth: Passport JWT + argon2id
- Charts: Recharts
- Testing: Jest (API) + Vitest (web) + Playwright (E2E)
- Deploy: Vercel (web) + Railway (API) + MongoDB Atlas

## Commands
- Build:       `npm run build`        → `turbo run build`
- Test:        `npm test`             → `turbo run test`
- Lint:        `npm run lint`         → `turbo run lint`
- Type check:  `npm run type-check`   → `turbo run type-check`
- Dev:         `npm run dev`          → `turbo run dev`
- Auto-commit: `npm run auto-commit -- --help`
- Auto-PR:     `npm run auto-pr -- --help`

## Architecture

```
finance-tracker/
├── apps/
│   ├── web/              → Next.js 15 (src/app/, components/, hooks/, lib/)
│   └── api/              → NestJS (src/auth/, users/, categories/, expenses/, analytics/, realtime/)
├── packages/
│   ├── shared/           → TypeScript types + Zod schemas (IUser, ICategory, IExpense, analytics)
│   ├── finance-utils/    → Pure financial logic: interest, amortization, recurrence
│   └── ui/               → shadcn/ui re-exported as a workspace package
└── scripts/              → auto-commit.js, auto-pr.js, auto-jira.js, dashboard.js
```

## Expense Types (Core Model)
- **Simple**: one-time payment (amount, date, category)
- **Recurring**: subscription (amount, frequency, nextDueDate, isActive)
- **Installment**: installment/loan (totalAmount, numInstallments, interestRate, interestType: none|simple|compound, paymentSchedule[])

## Conventions
- Server Components by default in Next.js; `'use client'` only when necessary
- Soft deletes — never physically delete records (`deletedAt` instead of DELETE)
- All models have `createdAt`, `updatedAt`, `deletedAt?`
- Mongoose discriminator `__t` for expense types in a single collection
- Cursor-based pagination (cursor = last `_id`) on `GET /api/expenses`
- Conventional Commits (see `semantic-versioning` skill)
- No explicit `any` — TypeScript strict mode

## Real-time (Socket.io)
- Auth on handshake: `socket.auth.token` (JWT Bearer)
- Each user joins room `user:{userId}`
- Key events: `expense:created`, `expense:updated`, `expense:deleted`, `installment:paid`, `analytics:refresh` (debounced 500ms), `budget:alert`, `recurring:due_soon`

## Environment Variables (`.env.local`)
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

## Agent Workflow (Claude Code)
Subagents live in `~/.claude/agents/`. In other tools, replicate the flow manually using the decision tree below.

### Decision tree: which agent to use
```
What do you need?
- Design architecture / decide approach        → solutions-expert
- Generate Jira ticket hierarchy               → ticket-orchestrator
- Backend API (NestJS/MongoDB)                 → backend-expert
- Frontend (Next.js + a11y + design)           → frontend-expert
- AWS architecture                             → aws-architect
- Infrastructure as Code (CDK)                 → cdk-expert
- Create PR (TELUS format)                     → pr-manager
- General review + light scanning              → code-reviewer-pro
- Deep security (auth/crypto/IAM)              → security-expert
- Docs + versioning + releases                 → documentation-generator
- Orchestrate several of the above             → agent-orchestrator
```

Typical pipeline: solutions-expert → (backend|frontend) → code-reviewer-pro → pr-manager.

## Critical Rules
- NEVER push directly to `main`.
- NEVER commit `.env.local` or secrets.
- ALWAYS run lint + tests before opening a PR.
- Keep scope tight: investigations spanning >50 files → spawn a subagent, not the main context.
