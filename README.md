# AXYRA — Quick Start

Resumen rápido de qué es AXYRA y cómo levantar el entorno localmente.

## Qué es

AXYRA es una plataforma para pymes y talleres que centraliza clientes, servicios y ventas, y automatiza flujos de trabajo (recordatorios, asignación de tareas, notificaciones y reportes).

## Requisitos

- Node 18+
- npm
- Cuenta Supabase (URL y Keys)

## Variables de entorno

Crea `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
INTERNAL_API_KEY=...
NEXT_PUBLIC_VERCEL_URL=localhost:3000
```

## Levantar local

```bash
npm install
npm run dev
```

## Configuración Supabase

Sigue `docs/SETUP_SUPABASE_VERCEL.md` para:

- Ejecutar trigger SQL (`docs/SUPABASE_CREATE_PROFILE_TRIGGER.sql`)
- Añadir políticas RLS en `profiles`
- Añadir variables en Vercel

## CI/CD

Se incluye un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta `npm ci` y `npm run build`, y opcionalmente prueba el endpoint protegido si se configuran secretos.

## Soporte

Para ayuda rápida, revisa `docs/README_REGISTER_FLOW.md`.

<!-- husky pre-commit test -->
