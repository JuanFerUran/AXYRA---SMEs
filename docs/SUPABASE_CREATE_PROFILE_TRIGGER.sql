-- Supabase SQL: Create trigger to populate `profiles` on auth.users insert
-- Run this in Supabase SQL editor (Database -> New Query)

-- Create profiles table if not exists (adjust columns to your schema)
-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id uuid PRIMARY KEY,
--   email text,
--   first_name text,
--   last_name text,
--   role text,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now()
-- );

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger AS $$
BEGIN
  -- Insert or update profile row for new user
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, (NEW.raw_user_meta ->> 'first_name')::text, (NEW.raw_user_meta ->> 'last_name')::text, 'admin', now(), now())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
        updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS auth_user_created ON auth.users;

-- Create trigger on auth.users insert
CREATE TRIGGER auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_created();
