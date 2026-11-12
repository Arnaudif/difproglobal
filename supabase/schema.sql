-- À exécuter dans Supabase > SQL Editor. L'accès se fait uniquement via le backend (clé service).
create table if not exists profiles(
  pi_uid text primary key, username text not null,
  role text not null default 'user' check (role in ('user','provider','admin')),
  created_at timestamptz not null default now());
create table if not exists requests(
  id uuid primary key default gen_random_uuid(), reference text unique not null,
  pi_uid text not null references profiles(pi_uid),
  service text not null, description text not null, location text, budget text,
  status text not null default 'received' check (status in ('received','in_review','quote_sent','accepted','done','refused')),
  created_at timestamptz not null default now());
create table if not exists notifications(
  id uuid primary key default gen_random_uuid(), pi_uid text not null references profiles(pi_uid),
  title text not null, read boolean not null default false, created_at timestamptz not null default now());
alter table profiles enable row level security;
alter table requests enable row level security;
alter table notifications enable row level security;
-- Aucune politique : seul le backend (clé service) lit et écrit. Le navigateur n'a aucun accès direct.
