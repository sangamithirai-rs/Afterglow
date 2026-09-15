-- videos: video memories belonging to an experience
create table videos (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  storage_path text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table videos enable row level security;

-- Owners can view their videos
create policy "Users can view their own videos"
on videos
for select
to authenticated
using (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and experiences.user_id = auth.uid()
  )
);

-- Owners can add videos
create policy "Users can insert their own videos"
on videos
for insert
to authenticated
with check (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and experiences.user_id = auth.uid()
  )
);

-- Owners can update their videos
create policy "Users can update their own videos"
on videos
for update
to authenticated
using (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and experiences.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and experiences.user_id = auth.uid()
  )
);

-- Owners can delete their videos
create policy "Users can delete their own videos"
on videos
for delete
to authenticated
using (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and experiences.user_id = auth.uid()
  )
);