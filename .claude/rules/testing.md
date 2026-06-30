---
paths: ["src/**/*.test.*", "src/**/*.spec.*", "tests/**", "__tests__/**"]
---
# Convenciones de Testing

- No `.only()` ni `.skip()` en tests commiteados.
- Cobertura mínima: 80% (objetivo: 90%).
- Tests de integración NO mockean la base de datos — deben usar una instancia real o de test.
- Un test por caso de negocio, no por línea de código.
- Nombres de tests en formato: `describe("qué") → it("hace qué cuando condición")`.
