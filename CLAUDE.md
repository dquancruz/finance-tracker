# <Project Name>

> One line: what this repo is.

## Tech Stack
- Runtime: <Node.js 20 / Python 3.12>
- Framework: <Next.js 15 / FastAPI>
- Database: <MongoDB / PostgreSQL>
- Testing: <Jest / pytest>
- Infra: <AWS + CDK>

## Commands
- Build:  `npm run build`
- Test:   `npm test`
- Lint:   `npm run lint`
- Deploy: `npm run deploy`
- Auto-commit: `npm run auto-commit -- --help`

## Architecture
- `src/api/`        → backend endpoints and logic
- `src/components/` → UI components
- `scripts/`        → automation (auto-commit, auto-pr, auto-jira)
- See `docs/` for detailed architecture.

## Conventions
- <Server components by default; 'use client' only when necessary>
- <Soft deletes — no physical deletion>
- Commits: Conventional Commits (see `semantic-versioning` skill).

## Agent Workflow (Claude Code)
Subagents live in `~/.claude/agents/`. In other tools, replicate the flow manually using the decision tree below.

### Decision tree: which agent to use
```
What do you need?
- Design architecture / decide approach        → solutions-expert
- Generate Jira ticket hierarchy               → ticket-orchestrator
- Backend API (NestJS/FastAPI/Mongo)           → backend-expert
- IoT backend (Raspberry Pi/GPIO/edge)         → iot-backend-expert
- Frontend (React/Next/Astro + a11y)           → frontend-expert
- AWS architecture                             → aws-architect
- Infrastructure as Code (CDK)                 → cdk-expert
- Write/strengthen unit tests                  → test-engineer
- Create a PR (project's standard format)      → pr-manager
- General review + light scanning              → code-reviewer-pro
- Deep security (auth/crypto/IAM)              → security-expert
- Docs + versioning + releases                 → documentation-generator
- Orchestrate several of the above             → agent-orchestrator
```

Typical pipeline: solutions-expert → (backend|frontend) → test-engineer → code-reviewer-pro → pr-manager.

> `test-engineer` = coverage and test quality for the code backend-expert/frontend-expert just wrote (always, before general review).
> `code-reviewer-pro` = general review with light scanning (always).
> `security-expert` = deep escalation: only when touching auth, sensitive data, crypto, secrets, network, or IaC.
> Before `pr-manager` opens a PR, the `pr-review-gate` skill gates it: zero BLOCKER findings from code-reviewer-pro (coherence, performance, reusability, security) and zero missing critical-path coverage from test-engineer, plus security-expert sign-off when escalated. `pr-manager` refuses `auto-pr` until that's clean, and batches any comments from the external AI reviewer into one fix instead of reacting one at a time.

## Critical Rules
- NEVER push directly to `main`.
- NEVER commit `.env.local` or secrets.
- ALWAYS run lint + tests before opening a PR.
- Keep scope tight: investigations spanning >50 files → spawn a subagent, not the main context.
