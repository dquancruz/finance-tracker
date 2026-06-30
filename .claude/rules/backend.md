---
paths: ["src/api/**", "src/services/**", "src/modules/**"]
---
# Convenciones Backend

- Validar todo input con Zod (TS) o Pydantic (Python) — nunca confiar en datos externos sin schema.
- Errores tipados, nunca `throw new Error("mensaje genérico")`.
- No filtrar stack traces al cliente — usar mensajes de error seguros.
- Soft deletes por defecto — no `DELETE` físico salvo excepción explícita.
- Paginación obligatoria en endpoints que devuelven colecciones.
- Rate limiting en rutas públicas (auth, registro, contacto).
