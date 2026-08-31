# Changelog

## [0.8.9] - 2026-08-31

- chore(deps): bump softprops/action-gh-release from 2 to 3 (#25)
- fix(api): resolve Railway Docker build failure for argon2 (#37)


## [0.8.8] - 2026-08-27

- Merge pull request #33 from dquancruz/dependabot/npm_and_yarn/globals-17.11.0
- chore(deps-dev): bump globals from 17.7.0 to 17.11.0


## [0.8.7] - 2026-08-27

- chore(deps-dev): bump prettier from 3.9.4 to 3.9.6 (#32)


## [0.8.6] - 2026-08-27

- chore(deps-dev): bump turbo from 2.10.2 to 2.10.11 (#28)


## [0.8.5] - 2026-08-27

- chore(deps-dev): bump @playwright/test from 1.61.1 to 1.62.1 (#31)


## [0.8.4] - 2026-08-27

- chore(deps): bump the production-patches group with 7 updates (#26)
- Merge pull request #30 from dquancruz/dependabot/npm_and_yarn/tailwindcss/postcss-4.3.3
- chore(deps-dev): bump @tailwindcss/postcss from 4.3.2 to 4.3.3


## [0.8.3] - 2026-08-27

- chore(deps-dev): bump @nestjs/testing from 11.1.27 to 11.2.1 (#29)


## [0.8.2] - 2026-08-27

- fix(security): address QA review and restore public landing and login (#24)


## [0.8.1] - 2026-08-27

- fix(security): harden authentication boundaries (#19)


## [0.8.0] - 2026-08-06

- feat(installments): replace placeholder with a real payoff dashboard (#18)
- feat(categories): allow per-user budgets on system categories (#17)


## [0.7.0] - 2026-08-06

- feat(web): apply quiet-preset design pass across the app (#16)


## [0.6.3] - 2026-08-06

- fix(auth): return user object from login/register to match web's NextAuth authorize() (#15)


## [0.6.2] - 2026-08-05

- fix(deploy): point web healthcheck at /login instead of / (#14)


## [0.6.1] - 2026-08-05

- fix(deploy): give the web Railway service its own config file (#13)


## [0.6.0] - 2026-08-05

- feat(deploy): add Dockerfile for apps/web Railway deployment (#12)


## [0.5.1] - 2026-08-05

- fix(api): coerce string-typed numeric env vars + Railway deploy config (#11)


## [0.5.0] - 2026-08-05

- feat: Phase 5 — Polish & Production [PHASE-5] (#10)


## [0.4.1] - 2026-07-09

- fix(notifications): atomic dedupe guard for cron notifications (#9)


## [0.4.0] - 2026-07-02

- feat: Phase 4 — Real-time & Notifications [PHASE-4] (#8)


## [0.3.0] - 2026-07-02

- feat: Phase 3 — Analytics & Dashboard Data [PHASE-3] (#7)


## [0.2.1] - 2026-07-01

- Merge pull request #6 from dquancruz/feat/initial-setup
- Merge pull request #5 from dquancruz/fix/jira-workflow-and-changelog
- fix(ci): scope Jira key extraction and fix CHANGELOG header duplication


## [0.2.0] - 2026-07-01

- Merge pull request #4 from dquancruz/feat/phase-2-expense-category-crud
- feat(web): add expenses list, CRUD forms, and recurring wizard
- feat(web): add categories management page with budget configuration
- fix(web): wrap login page in a Suspense boundary
- feat(api): add expenses module with discriminated schema and recurring/installment engines
- feat(api): add categories CRUD module with budget limits
- chore: sync package-lock.json with finance-utils workspace dependency

## [0.1.1] - 2026-07-01

- Merge pull request #3 from dquancruz/docs/translate-instructions-to-english
- docs: translate instruction files to English

## [0.1.0] - 2026-06-30

- Merge pull request #2 from dquancruz/feat/phase-1-complete
- fix(ci): tighten secrets scan to exclude space-containing values
- fix(finance-utils): add shared dep and fix exhaustive switch in recurrence
- chore: add root config, web app foundation, and fix pre-commit hook
- docs: add PHASES.md roadmap, update README in English, update AGENTS.md
- feat(packages): scaffold ui package, add amortization tests, fix timezone test bug
- feat(web): add placeholder pages for expenses, categories, installments
- fix(web): rename middleware, add SessionProvider, fix auth API path
- feat(api): wire AppModule, implement auth module with JWT and argon2id
- Merge pull request #1 from dquancruz/feat/initial-setup
- chore: initial repo setup with claude automation tooling
- chore: initialize repository
