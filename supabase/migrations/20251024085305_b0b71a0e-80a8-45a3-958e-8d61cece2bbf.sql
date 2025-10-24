-- Fix Thread table RLS policies to allow inserts
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role write threads" ON public."Thread";

-- Create new policies for public inserts
CREATE POLICY "Anyone can create threads" 
ON public."Thread"
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update threads" 
ON public."Thread"
FOR UPDATE 
USING (true);

-- Keep the public read policy as is
-- CREATE POLICY "Public read threads" already exists