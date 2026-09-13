-- profiles: mirrors auth.users, holds public-facing user info
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- experiences: the core entity — a memory/trip/event
create table experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  location text,
  event_date date,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_public boolean not null default false,
  share_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- photos: gallery images belonging to an experience
create table photos (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  storage_path text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- songs: the soundtrack of an experience
create table songs (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  title text not null,
  artist text,
  url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- timeline_entries: chronological moments within an experience
create table timeline_entries (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  entry_date date,
  title text not null,
  note text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- people: who was part of the experience
create table people (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  name text not null,
  relationship text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update `updated_at` whenever an experience row changes
create function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_experience_updated
  before update on experiences
  for each row execute function public.handle_updated_at();