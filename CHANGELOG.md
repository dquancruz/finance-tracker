# Changelog

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
