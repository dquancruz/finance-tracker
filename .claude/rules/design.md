---
paths: ["src/components/**", "src/app/**", "src/ui/**", "src/styles/**"]
---
# Dirección de Diseño

Design preset: quiet

<!-- Reemplazar "quiet" con el preset del cliente: velocity | vice | quiet -->
<!-- O copiar los tokens reales del cliente aquí: -->
<!-- Primary: #hex, Font: "Nombre", Scale: 1.250 -->

## Selección de preset
El agente frontend-expert carga siempre la skill `design-system` al hacer UI.
Orden de prioridad: (1) preset nombrado en el prompt → (2) `Design preset:` en esta rule → (3) default `quiet` con aviso.
