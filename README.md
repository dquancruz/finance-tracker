# finance-tracker

A full-stack personal finance tracker with expense management, recurring payments, installment tracking, and real-time analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| UI Components | shadcn/ui (`@finance-tracker/ui`) |
| Auth | NextAuth.js v5 (credentials + Google OAuth) |
| State & Data | TanStack Query v5, Zustand |
| Backend | NestJS 11 |
| Database | MongoDB Atlas (Mongoose) |
| Password Hashing | argon2id |
| Real-time | Socket.io |
| Charts | Recharts |
| Testing | Jest (API + packages), Vitest (web) |
| CI/CD | GitHub Actions |
| Infra | AWS + CDK (planned) |

---

## Monorepo Structure

```
finance-tracker/
├── apps/
│   ├── api/                  # NestJS backend (port 3001)
│   │   └── src/
│   │       ├── auth/         # Auth module — register, login, JWT + Passport
│   │       └── users/        # Users module — Mongoose model and service
│   └── web/                  # Next.js 15 frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── (auth)/   # Login and register pages
│           │   └── (dashboard)/ # Protected dashboard pages
│           ├── components/   # Shared React components
│           └── lib/          # NextAuth config, API client
├── packages/
│   ├── shared/               # @finance-tracker/shared — TypeScript types
│   ├── finance-utils/        # @finance-tracker/finance-utils — financial logic
│   └── ui/                   # @finance-tracker/ui — shadcn/ui component library
└── scripts/                  # Automation: auto-commit, auto-pr, auto-jira, dashboard
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- A MongoDB Atlas cluster (free tier works)
- A Google OAuth app (optional — for Google sign-in)

### Installation

```bash
git clone https://github.com/dquancruz/finance-tracker.git
cd finance-tracker
npm install
```

### Environment Setup

Copy the example files and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

**`apps/api/.env`**

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/finance-tracker
JWT_SECRET=<random 32+ character string>
PORT=3001
```

**`apps/web/.env.local`**

```
NEXTAUTH_SECRET=<random 32+ character string>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
```

### Running Locally

```bash
# Run both apps in parallel (recommended)
npm run dev

# Or run individually
cd apps/api && npm run start:dev
cd apps/web && npm run dev
```

The web app will be at `http://localhost:3000` and the API at `http://localhost:3001`.

---

## Available Scripts

Run from the monorepo root:

| Script | Description |
|---|---|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all apps and packages |
| `npm run test` | Run all test suites |
| `npm run lint` | Lint all workspaces |
| `npm run type-check` | TypeScript type-check all workspaces |
| `npm run auto-commit` | Automated commit helper |
| `npm run auto-pr` | Automated PR creation |
| `npm run auto-jira` | Create Jira tickets from CLI |
| `npm run dashboard` | Show project progress dashboard |

---

## Project Phases

See [PHASES.md](./PHASES.md) for a full breakdown of what is built in each phase and what is planned.

- **Phase 1** — Foundation & Authentication (complete)
- **Phase 2** — Expense & Category CRUD (planned)
- **Phase 3** — Analytics & Dashboard Data (planned)
- **Phase 4** — Real-time & Notifications (planned)
- **Phase 5** — Polish & Production (planned)

---

## Contributing

### Branch Naming

```
feat/<ticket-id>-short-description
fix/<ticket-id>-short-description
chore/<ticket-id>-short-description
docs/<ticket-id>-short-description
```

Example: `feat/FT-42-expense-crud`

### Commit Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

feat(api): add expense CRUD endpoints
fix(web): correct pagination offset calculation
chore: update turbo pipeline configuration
```

Scopes: `api`, `web`, `shared`, `finance-utils`, `ui`, `ci`, `docs`.

### Pull Request Process

1. Create a feature branch from `main`.
2. Implement your changes with passing tests and lint.
3. Push and open a PR — the CI pipeline runs automatically.
4. Request a review. The PR will be merged after approval and green checks.

Never push directly to `main`.

---

## License

Private — all rights reserved.
