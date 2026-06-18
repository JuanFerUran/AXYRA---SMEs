-- SQL para crear la tabla `clients` en Supabase (Postgres)

-- Habilita extensión para generar UUID si no está disponible
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Index para búsquedas por email
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);
