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

# Changelog

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

