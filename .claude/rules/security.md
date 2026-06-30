---
paths: ["src/api/**", "src/auth/**", "src/middleware/**", "infra/**", "cdk/**"]
---
# Reglas de Seguridad

- Nunca commitear secretos, tokens ni credenciales — usar `.env.local` (gitignored).
- Auth: usar `argon2id` o `bcrypt` para hashing; nunca MD5/SHA1 para passwords.
- JWT: validar firma, expiración y audience en cada request.
- NoSQL: parametrizar queries — nunca interpolar input de usuario en filtros MongoDB.
- IAM: menor privilegio — sin wildcards en acciones ni recursos.
- S3: sin buckets públicos salvo activos estáticos explícitamente públicos.
- Secretos en AWS Secrets Manager o SSM Parameter Store, nunca en env del proceso.
- En cambios a esta zona: invocar `security-expert` para review profundo.
