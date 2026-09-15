-- Private video storage access for Afterglow.
-- Owners can upload/delete their own experience videos.
-- Published unlisted experiences can be viewed by anyone with the link.
-- Published invite-only experiences can be viewed by invited users.

create policy "Users can upload their own experience videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'experience-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.experiences
    where experiences.user_id = (select auth.uid())
      and name like (select auth.uid()::text) || '/' || experiences.id::text || '/%'
  )
);

create policy "Users can view allowed experience videos"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'experience-videos'
  and exists (
    select 1
    from public.videos
    join public.experiences
      on experiences.id = videos.experience_id
    where videos.storage_path = storage.objects.name
      and (
        -- Owner
        experiences.user_id = (select auth.uid())

        -- Anyone with the link
        or (
          experiences.status = 'published'
          and experiences.visibility = 'unlisted'
        )

        -- Invited viewers
        or (
          experiences.status = 'published'
          and experiences.visibility = 'invite_only'
          and exists (
            select 1
            from public.experience_invites
            where experience_invites.experience_id = experiences.id
              and lower(experience_invites.email) =
                  lower((select auth.jwt() ->> 'email'))
          )
        )
      )
  )
);

create policy "Users can delete their own experience videos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'experience-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update their own experience videos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'experience-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'experience-videos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);