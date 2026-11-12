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

-- Paiements Pi (migration « paiements_pi »)
alter table requests add column if not exists amount_pi numeric(20,7) check (amount_pi is null or amount_pi > 0),
  add column if not exists payment_status text not null default 'none' check (payment_status in ('none','pending','paid')),
  add column if not exists paid_at timestamptz;
create table if not exists payments(
  payment_id text primary key, reference text not null references requests(reference),
  pi_uid text not null references profiles(pi_uid), amount numeric(20,7) not null,
  status text not null default 'approved' check (status in ('approved','completed','cancelled')),
  txid text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table payments enable row level security;

-- Journal des actions d'administration
create table if not exists admin_logs(
  id uuid primary key default gen_random_uuid(), admin_uid text not null,
  action text not null, target text, created_at timestamptz not null default now());
alter table admin_logs enable row level security;
-- Premier administrateur : à faire UNE FOIS dans le SQL Editor, après votre première connexion Pi :
--   update profiles set role = 'admin' where lower(username) = lower('VOTRE_NOM_PI');
