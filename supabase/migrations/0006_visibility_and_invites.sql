-- Drop the old public-read policies that reference is_public — they'll conflict
-- with dropping that column, and we're replacing them with visibility-aware ones anyway.
drop policy if exists "Anyone can view public published experiences" on experiences;
drop policy if exists "Anyone can view photos of public published experiences" on photos;
drop policy if exists "Anyone can view songs of public published experiences" on songs;
drop policy if exists "Anyone can view timeline entries of public published experiences" on timeline_entries;
drop policy if exists "Anyone can view people in public published experiences" on people;

-- Add the new visibility column
alter table experiences
  add column visibility text not null default 'private'
  check (visibility in ('private', 'unlisted', 'invite_only'));

-- Migrate existing data: anything previously public becomes 'unlisted'
update experiences set visibility = 'unlisted' where is_public = true;

-- Now safe to drop the old column
alter table experiences drop column is_public;

-- New table: who's invited to view an invite-only experience
create table experience_invites (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (experience_id, email)
);

-- Only the owner can manage invites for their own experiences
create policy "Owners can view invites for their experiences"
  on experience_invites for select
  using (exists (select 1 from experiences where experiences.id = experience_invites.experience_id and experiences.user_id = auth.uid()));

create policy "Owners can add invites to their experiences"
  on experience_invites for insert
  with check (exists (select 1 from experiences where experiences.id = experience_invites.experience_id and experiences.user_id = auth.uid()));

create policy "Owners can remove invites from their experiences"
  on experience_invites for delete
  using (exists (select 1 from experiences where experiences.id = experience_invites.experience_id and experiences.user_id = auth.uid()));

-- New visibility-aware read policy for experiences (replaces the old is_public one)
create policy "Others can view visible published experiences"
  on experiences for select
  using (
    status = 'published'
    and (
      visibility = 'unlisted'
      or (
        visibility = 'invite_only'
        and exists (
          select 1 from experience_invites
          where experience_invites.experience_id = experiences.id
            and experience_invites.email = (auth.jwt() ->> 'email')
        )
      )
    )
  );

-- Same visibility logic for each child table, checking the parent experience
create policy "Others can view photos of visible experiences"
  on photos for select
  using (exists (
    select 1 from experiences e
    where e.id = photos.experience_id
      and e.status = 'published'
      and (
        e.visibility = 'unlisted'
        or (e.visibility = 'invite_only' and exists (
          select 1 from experience_invites ei
          where ei.experience_id = e.id and ei.email = (auth.jwt() ->> 'email')
        ))
      )
  ));

create policy "Others can view songs of visible experiences"
  on songs for select
  using (exists (
    select 1 from experiences e
    where e.id = songs.experience_id
      and e.status = 'published'
      and (
        e.visibility = 'unlisted'
        or (e.visibility = 'invite_only' and exists (
          select 1 from experience_invites ei
          where ei.experience_id = e.id and ei.email = (auth.jwt() ->> 'email')
        ))
      )
  ));

create policy "Others can view timeline entries of visible experiences"
  on timeline_entries for select
  using (exists (
    select 1 from experiences e
    where e.id = timeline_entries.experience_id
      and e.status = 'published'
      and (
        e.visibility = 'unlisted'
        or (e.visibility = 'invite_only' and exists (
          select 1 from experience_invites ei
          where ei.experience_id = e.id and ei.email = (auth.jwt() ->> 'email')
        ))
      )
  ));

create policy "Others can view people of visible experiences"
  on people for select
  using (exists (
    select 1 from experiences e
    where e.id = people.experience_id
      and e.status = 'published'
      and (
        e.visibility = 'unlisted'
        or (e.visibility = 'invite_only' and exists (
          select 1 from experience_invites ei
          where ei.experience_id = e.id and ei.email = (auth.jwt() ->> 'email')
        ))
      )
  ));