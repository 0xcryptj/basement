-- Update storage policies for avatars to allow public uploads
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow anyone to upload to public folder
CREATE POLICY "Anyone can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'public');

-- Allow anyone to update avatars in public folder
CREATE POLICY "Anyone can update avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'public');