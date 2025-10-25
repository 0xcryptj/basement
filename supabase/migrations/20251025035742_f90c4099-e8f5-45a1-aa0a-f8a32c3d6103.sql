-- Fix infinite recursion in User table RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own financial data" ON public."User";

-- Create security definer function to check wallet ownership
CREATE OR REPLACE FUNCTION public.is_own_wallet(_user_id text, _wallet_address text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."User"
    WHERE id = _user_id
      AND "walletAddress" = _wallet_address
  )
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view own financial data" 
ON public."User"
FOR SELECT 
USING (
  "walletAddress" = (auth.jwt() ->> 'wallet_address'::text)
  OR id = (SELECT id FROM public."User" WHERE "walletAddress" = (auth.jwt() ->> 'wallet_address'::text) LIMIT 1)
);

-- Ensure users can insert their own records
DROP POLICY IF EXISTS "Users can insert" ON public."User";
CREATE POLICY "Users can insert" 
ON public."User"
FOR INSERT 
WITH CHECK (
  "walletAddress" = (auth.jwt() ->> 'wallet_address'::text)
);

-- Ensure users can update their own records
DROP POLICY IF EXISTS "Users can update" ON public."User";
CREATE POLICY "Users can update" 
ON public."User"
FOR UPDATE 
USING (
  "walletAddress" = (auth.jwt() ->> 'wallet_address'::text)
);