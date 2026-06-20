# Configuración Supabase & Vercel para AXYRA

Este documento describe los pasos necesarios para que el flujo de registro y creación de perfiles funcione correctamente y de forma segura en producción.

## Resumen
- El signup en el frontend envía metadata (`first_name`, `last_name`) junto con `supabase.auth.signUp({ options: { data } })`.
- Un trigger en la base de datos (`auth.users` → `profiles`) crea/actualiza la fila `profiles` automáticamente y asigna `role = 'admin'`.
- Existe un endpoint de respaldo (`/api/auth/create-profile`) que usa la `service_role` key para `upsert` en `profiles`. Está protegido por un `INTERNAL_API_KEY` en `x-internal-secret`.

## Variables de entorno (Vercel)
Agrega estas variables en tu proyecto de Vercel (Project Settings → Environment variables):

- `NEXT_PUBLIC_SUPABASE_URL` — URL pública de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key.
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key (secreto, no público).
- `INTERNAL_API_KEY` — secreto interno para validar llamadas al endpoint server-side.
- `NEXT_PUBLIC_VERCEL_URL` — tu dominio en Vercel (ej: `axyra-smes.vercel.app`) (opcional, se usa para redirect en signup).

Notas:
- `SUPABASE_SERVICE_ROLE_KEY` debe guardarse como Secret.
- `INTERNAL_API_KEY` también debe guardarse como Secret.

## SQL: trigger para crear profiles automáticamente
Archivo incluido: `docs/SUPABASE_CREATE_PROFILE_TRIGGER.sql`

Pasos:
1. Abre la consola de Supabase → SQL Editor → New Query.
2. Pega y ejecuta el contenido de `docs/SUPABASE_CREATE_PROFILE_TRIGGER.sql`.
   - El trigger copia `first_name` y `last_name` desde los metadatos del usuario y asigna `role = 'admin'`.

> Ajusta las columnas del `profiles` si tu esquema difiere.

## Políticas RLS recomendadas para `public.profiles`
Usa RLS para restringir acceso a `profiles`:

1. Habilitar RLS
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

2. Permitir que el usuario vea su propio perfil
```sql
CREATE POLICY "users_can_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
```

3. Permitir que el usuario actualice su propio perfil
```sql
CREATE POLICY "users_can_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

4. (Opcional) No crear una policy pública de `INSERT` que permita a cualquiera crear perfiles. El `service_role` key de Supabase ignora RLS, así que el endpoint administrativo o el trigger de `auth.users` serán los encargados de crear/actualizar perfiles.

## Endpoint de respaldo `POST /api/auth/create-profile`
- Implementado en: `src/app/api/auth/create-profile/route.ts`.
- Requiere header `x-internal-secret: <INTERNAL_API_KEY>` para aceptar la petición.

Ejemplo de llamada (server → server):

```bash
curl -X POST https://<your-deploy>/api/auth/create-profile \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: $INTERNAL_API_KEY" \
  -d '{"userId":"<user-uuid>","email":"user@example.com","first_name":"Juan","last_name":"Pérez","role":"admin"}'
```

> Este endpoint usa `SUPABASE_SERVICE_ROLE_KEY` internamente para realizar el upsert en `profiles`.

## Pruebas locales y build
1. Crea un archivo `.env.local` en la raíz con las variables (no lo comites):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
INTERNAL_API_KEY=...
NEXT_PUBLIC_VERCEL_URL=localhost:3000
```

2. Ejecuta localmente:

```bash
npm install
npm run dev
# o para producción local
npm run build
npm start
```

3. Comprueba que el signup crea el usuario en Supabase Auth y que la tabla `profiles` se actualiza (Ver logs SQL/Tabla).

## Comprobación en Vercel
- Después del push, en Vercel ➜ Deploys, revisa el log de Build y la ejecución final.
- Si hay errores de typescript, mira el log de `vercel build` y valida en local con `npm run build`.

## Seguridad y notas finales
- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` ni `INTERNAL_API_KEY` en el frontend.
- Revisa las policies RLS y prueba con un usuario normal vs token admin (service role).
- Si prefieres que no todos los usuarios sean `admin`, ajusta el trigger SQL y el endpoint para asignar roles adecuados (ej: `user` por defecto) o utiliza un flujo de aprobación manual.

---

Si quieres, genero un `README.md` con pasos resumidos para el README del repo o lo subo como `docs/SETUP_QUICK.md`.
