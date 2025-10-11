-- Storage policies for forum-images bucket

-- Create the bucket if it doesn't exist (run in Supabase UI)
-- Bucket name: forum-images
-- Public: true

-- Allow public read access to all images
CREATE POLICY "Public read access forum images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'forum-images' );

-- Allow anyone to upload images (you may want to restrict this)
CREATE POLICY "Public upload forum images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'forum-images' );

-- Allow service role to delete images (for moderation)
CREATE POLICY "Service role delete forum images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'forum-images' AND
  auth.jwt() ->> 'role' = 'service_role'
);

