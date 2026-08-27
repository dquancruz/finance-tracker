# finance-tracker — Project Phases

## Phase 1 — Foundation & Authentication (Complete)

**Goal:** Monorepo setup, shared packages, and full authentication flow.

### Backend

- NestJS monorepo app with MongoDB Atlas connection
- User schema with soft deletes and OAuth provider support
- `POST /auth/register` — argon2id password hashing via RegisterDto
- `POST /auth/login` — Passport local strategy returns JWT
- JWT strategy for guarding protected routes
- ConfigModule + MongooseModule wired in AppModule

### Frontend

- Next.js 15 App Router with route groups `(auth)` and `(dashboard)`
- Login page — credentials sign-in and Google OAuth
- Registration page with client-side validation
- Route protection via NextAuth v5 middleware (`src/middleware.ts`)
- Dashboard layout with sidebar navigation
- Dashboard summary page with skeleton cards (real data in Phase 3)
- Placeholder pages for Expenses, Categories, and Installments
- SessionProvider and QueryClientProvider wired in root Providers

### Shared Packages

- `@finance-tracker/shared` — TypeScript types for User, Category, Expense, Analytics
- `@finance-tracker/finance-utils` — interest, recurrence, and amortization calculators with tests
- `@finance-tracker/ui` — shadcn/ui component library scaffold

### Infrastructure

- Turborepo build pipeline with task dependency graph
- GitHub Actions: PR validation (lint + tests + secrets scan)
- GitHub Actions: on-merge release pipeline (semver bump, CHANGELOG, GitHub Release, Jira)
- Automation scripts: auto-commit, auto-pr, auto-jira, dashboard
- Husky pre-commit hooks

---

## Phase 2 — Expense & Category CRUD (Complete)

**Goal:** Full expense management with categories and recurring expenses.

### Backend

- Expense schema (simple, recurring, installment — discriminated union)
- Category schema with budget limits
- CRUD endpoints: `/expenses`, `/categories`
- Recurring expense engine (driven by finance-utils recurrence logic)
- Installment payment tracking

### Frontend

- Expenses list with filtering, sorting, and pagination
- Add/edit expense form with category selector
- Categories management page with budget configuration
- Recurring expense creation wizard

---

## Phase 3 — Analytics & Dashboard Data (Complete)

**Goal:** Real dashboard data, charts, and financial insights.

### Backend

- Analytics aggregation endpoints
- Monthly/yearly spend by category
- Budget vs. actual comparison
- Upcoming payments (next 30 days)

### Frontend

- Dashboard with real data (replace skeleton cards)
- Recharts: monthly trend line, category breakdown pie chart
- Budget status cards
- Upcoming payments list

---

## Phase 4 — Real-time & Notifications (Complete)

**Goal:** Live updates and proactive alerts.

### Backend

- Socket.io integration for real-time expense updates
- Notification system for budget overruns and upcoming payments

### Frontend

- Real-time dashboard updates via WebSocket
- In-app notification center
- Push notification support

---

## Phase 5 — Polish & Production (Complete)

**Goal:** Performance, accessibility, and production hardening.

- PWA support
- Full a11y audit (WCAG 2.1 AA)
- Performance optimization (ISR, image optimization)
- Production MongoDB Atlas configuration
- Rate limiting and API security hardening
- E2E tests (Playwright)
- Public product landing page with sanitized product previews
- Dashboard route moved to `/dashboard` with explicit failure and retry states
- Google OAuth identity exchange with canonical API users
- Dependency audit and full build gates in pull-request CI
