# Flujo de registro y seguridad (AXYRA)

Este documento describe el flujo interno cuando un usuario se registra y qué verificaciones/medidas de seguridad están en su lugar.

## Flujo de registro (frontend → Supabase)
1. El usuario completa: `email`, `password`, `firstName`, `lastName` en el formulario de registro.
2. El frontend llama:
```ts
supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo, data: { first_name, last_name } }
});
```
3. Supabase crea la fila en `auth.users` y guarda la metadata enviada en el usuario.
4. El trigger SQL (`auth.users` AFTER INSERT) se ejecuta y realiza un `INSERT ... ON CONFLICT` en `public.profiles`, copiando `first_name`/`last_name` y asignando `role = 'admin'`.

## Endpoint de respaldo (server)
- `POST /api/auth/create-profile` permite realizar un upsert al `profiles` usando `SUPABASE_SERVICE_ROLE_KEY`.
- Está protegido por la cabecera `x-internal-secret` que debe coincidir con `INTERNAL_API_KEY`.
- Uso previsto: integraciones internas, migraciones, correcciones manuales desde backend.

## Recomendaciones de seguridad
- Mantén `SUPABASE_SERVICE_ROLE_KEY` sólo en entornos de servidor (Vercel Secrets).
- `INTERNAL_API_KEY` debe ser un valor aleatorio y secreto, diferente del service role.
- No habilites políticas de `INSERT` públicas en `profiles`; usa el trigger o el service role para crear perfiles.
- Revisa logs y auditoría en Supabase para detectar inserciones inesperadas.

## Verificaciones y pruebas sugeridas
- Crear un usuario en el panel de Auth (Supabase) y verificar que `profiles` se creó.
- Probar signup desde `npm run dev` con `.env.local` y comprobar `profiles`.
- Usar el endpoint protegido con curl (ver `docs/SETUP_SUPABASE_VERCEL.md`) para hacer un upsert.

## Operaciones posteriores
- Si quieres asignar roles distintos a `admin` según condiciones, modifica la lógica del trigger o el endpoint para decidir `role`.

---

¿Deseas que cree un `README.md` resumido en la raíz del repo con estos pasos esenciales?