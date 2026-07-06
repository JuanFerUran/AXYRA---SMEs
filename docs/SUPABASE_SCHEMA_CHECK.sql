-- SQL to verify and create the minimum tables needed for the app
-- Run this in Supabase SQL editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  role text not null default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  nationality text,
  occupation text,
  preferred_contact text,
  avatar_url text,
  client_status_id uuid,
  total_purchases integer default 0,
  lifetime_value numeric default 0,
  last_purchase_date timestamptz,
  average_order_value numeric default 0,
  country text,
  state text,
  city text,
  postal_code text,
  address text,
  tags text[],
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;

create or replace function public.handle_auth_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    'admin'
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists auth_user_created on auth.users;
create trigger auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();