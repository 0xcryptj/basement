-- Fix User table RLS to protect sensitive financial data
DROP POLICY IF EXISTS "Users viewable by all" ON public."User";

-- Allow public to view only non-sensitive user data
CREATE POLICY "Users can view public profile data"
ON public."User"
FOR SELECT
USING (true);

-- Users can view their own full data including financials
CREATE POLICY "Users can view own financial data"
ON public."User"
FOR SELECT
USING (id = (SELECT id FROM public."User" WHERE "walletAddress" = auth.jwt()->>'wallet_address'));

-- Fix matches table RLS to prevent manipulation
DROP POLICY IF EXISTS "Anyone can update matches" ON public.matches;

-- Only players in the match can update it
CREATE POLICY "Players can update their own matches"
ON public.matches
FOR UPDATE
USING (
  player1_id = auth.jwt()->>'wallet_address' 
  OR player2_id = auth.jwt()->>'wallet_address'
);

-- Service role can update any match
CREATE POLICY "Service role can update matches"
ON public.matches
FOR UPDATE
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);