---
paths: ["src/api/**", "src/services/**", "src/modules/**"]
---
# Backend Conventions

- Validate all input with Zod (TS) or Pydantic (Python) — never trust external data without a schema.
- Use typed errors, never `throw new Error("generic message")`.
- Do not leak stack traces to the client — use safe error messages.
- Soft deletes by default — no physical `DELETE` unless explicitly required.
- Pagination required on endpoints that return collections.
- Rate limiting on public routes (auth, registration, contact).
