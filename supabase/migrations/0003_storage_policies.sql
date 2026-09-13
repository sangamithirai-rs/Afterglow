create policy "Users can upload their own cover images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'experience-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own cover images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'experience-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own cover images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'experience-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);