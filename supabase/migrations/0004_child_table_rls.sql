-- PHOTOS
create policy "Users can view photos of their own experiences"
  on photos for select
  using (exists (select 1 from experiences where experiences.id = photos.experience_id and experiences.user_id = auth.uid()));

create policy "Users can insert photos into their own experiences"
  on photos for insert
  with check (exists (select 1 from experiences where experiences.id = photos.experience_id and experiences.user_id = auth.uid()));

create policy "Users can delete photos from their own experiences"
  on photos for delete
  using (exists (select 1 from experiences where experiences.id = photos.experience_id and experiences.user_id = auth.uid()));

-- SONGS
create policy "Users can view songs of their own experiences"
  on songs for select
  using (exists (select 1 from experiences where experiences.id = songs.experience_id and experiences.user_id = auth.uid()));

create policy "Users can insert songs into their own experiences"
  on songs for insert
  with check (exists (select 1 from experiences where experiences.id = songs.experience_id and experiences.user_id = auth.uid()));

create policy "Users can delete songs from their own experiences"
  on songs for delete
  using (exists (select 1 from experiences where experiences.id = songs.experience_id and experiences.user_id = auth.uid()));

-- TIMELINE ENTRIES
create policy "Users can view timeline entries of their own experiences"
  on timeline_entries for select
  using (exists (select 1 from experiences where experiences.id = timeline_entries.experience_id and experiences.user_id = auth.uid()));

create policy "Users can insert timeline entries into their own experiences"
  on timeline_entries for insert
  with check (exists (select 1 from experiences where experiences.id = timeline_entries.experience_id and experiences.user_id = auth.uid()));

create policy "Users can delete timeline entries from their own experiences"
  on timeline_entries for delete
  using (exists (select 1 from experiences where experiences.id = timeline_entries.experience_id and experiences.user_id = auth.uid()));

-- PEOPLE
create policy "Users can view people in their own experiences"
  on people for select
  using (exists (select 1 from experiences where experiences.id = people.experience_id and experiences.user_id = auth.uid()));

create policy "Users can insert people into their own experiences"
  on people for insert
  with check (exists (select 1 from experiences where experiences.id = people.experience_id and experiences.user_id = auth.uid()));

create policy "Users can delete people from their own experiences"
  on people for delete
  using (exists (select 1 from experiences where experiences.id = people.experience_id and experiences.user_id = auth.uid()));