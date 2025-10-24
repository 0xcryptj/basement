-- Create avatars storage bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add PNL tracking columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalWagered" numeric DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalWon" numeric DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalLost" numeric DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "netProfit" numeric DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gamesPlayed" integer DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gamesWon" integer DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "winRate" numeric DEFAULT 0;