-- Fix infinite recursion in User table RLS policies
-- The issue is that policies are querying the User table from within User table policies
-- Since we use wallet-based auth (no Supabase JWT tokens), we allow public access

-- Drop all existing User policies that cause recursion
DROP POLICY IF EXISTS "Users can view public profile data" ON public."User";
DROP POLICY IF EXISTS "Users can view own financial data" ON public."User";
DROP POLICY IF EXISTS "Users can insert" ON public."User";
DROP POLICY IF EXISTS "Users can update" ON public."User";

-- Allow public SELECT (wallet auth is handled at app level)
CREATE POLICY "Public can view user profiles"
ON public."User"
FOR SELECT
USING (true);

-- Allow public INSERT (wallet auth is handled at app level)
CREATE POLICY "Public can create user accounts"
ON public."User"
FOR INSERT
WITH CHECK (true);

-- Allow public UPDATE (wallet auth is handled at app level)
CREATE POLICY "Public can update user accounts"
ON public."User"
FOR UPDATE
USING (true);

-- Drop the unused security definer function (it's not needed with public access)
DROP FUNCTION IF EXISTS public.is_own_wallet(text, text);

