-- Fix Post table RLS policies to allow inserts
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role write posts" ON public."Post";

-- Create new policies for public operations
CREATE POLICY "Anyone can create posts" 
ON public."Post"
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update posts" 
ON public."Post"
FOR UPDATE 
USING (true);

-- Public read policy already exists