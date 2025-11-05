-- Fix RLS policies for matches and waiting_players tables
-- This allows games to be created and saved in demo mode without Supabase auth

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Players can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can create matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can update matches" ON public.matches;
DROP POLICY IF EXISTS "Players can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Service role can update matches" ON public.matches;

DROP POLICY IF EXISTS "Users can join queue" ON public.waiting_players;
DROP POLICY IF EXISTS "Users can leave queue" ON public.waiting_players;
DROP POLICY IF EXISTS "Anyone can join waiting queue" ON public.waiting_players;
DROP POLICY IF EXISTS "Anyone can leave waiting queue" ON public.waiting_players;

-- Matches table policies - allow all operations for demo mode
-- (Security can be added back later when implementing smart contracts)

-- INSERT: Allow anyone to create matches
CREATE POLICY "Anyone can create matches"
ON public.matches
FOR INSERT
WITH CHECK (true);

-- UPDATE: Allow anyone to update matches (needed for joining games, updating status)
CREATE POLICY "Anyone can update matches"
ON public.matches
FOR UPDATE
USING (true);

-- DELETE: Allow deletion of waiting matches (for timeout/cancellation)
CREATE POLICY "Anyone can delete waiting matches"
ON public.matches
FOR DELETE
USING (status = 'waiting');

-- Waiting players table policies - allow all operations for demo mode

-- INSERT: Allow anyone to join waiting queue
CREATE POLICY "Anyone can join waiting queue"
ON public.waiting_players
FOR INSERT
WITH CHECK (true);

-- DELETE: Allow anyone to leave waiting queue
CREATE POLICY "Anyone can leave waiting queue"
ON public.waiting_players
FOR DELETE
USING (true);

-- Verify policies are correct
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('matches', 'waiting_players')
ORDER BY tablename, policyname;

