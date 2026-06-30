---
paths: ["src/components/**", "src/pages/**", "src/app/**", "src/ui/**"]
---
# Convenciones Frontend

- Server Components por defecto; `'use client'` solo cuando sea necesario.
- Accesibilidad no es opcional: WCAG AA mínimo, HTML semántico, navegación por teclado.
- No `any` en TypeScript — si algo requiere `any`, usar `unknown` y narrowing explícito.
- No `console.log` en código commiteado.
- Responsive desde mobile-first.
- Ver skill `design-system` para presets de diseño activos.
