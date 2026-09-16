create policy "Viewers can view allowed experience videos"
on videos
for select
to anon, authenticated
using (
  exists (
    select 1
    from experiences
    where experiences.id = videos.experience_id
      and (
        -- Owner
        experiences.user_id = auth.uid()

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
            from experience_invites
            where experience_invites.experience_id = experiences.id
              and lower(experience_invites.email) =
                  lower((auth.jwt() ->> 'email'))
          )
        )
      )
  )
);