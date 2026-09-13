-- experiences: owners can do everything with their own rows
create policy "Users can view their own experiences"
  on experiences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own experiences"
  on experiences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own experiences"
  on experiences for update
  using (auth.uid() = user_id);

create policy "Users can delete their own experiences"
  on experiences for delete
  using (auth.uid() = user_id);

-- profiles: users can view and update their own profile
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);