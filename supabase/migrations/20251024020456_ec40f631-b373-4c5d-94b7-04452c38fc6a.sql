-- Fix RLS policies to work with wallet-based authentication (no Supabase auth)

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Players can update their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can join queue" ON public.waiting_players;
DROP POLICY IF EXISTS "Users can leave queue" ON public.waiting_players;
DROP POLICY IF EXISTS "Authenticated users can create entries" ON public.lucky_block_entries;

-- Matches table - allow anyone to insert and update (wallet auth happens in app)
CREATE POLICY "Anyone can create matches"
ON public.matches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
ON public.matches
FOR UPDATE
USING (true);

-- Waiting players - allow anyone to manage
CREATE POLICY "Anyone can join waiting queue"
ON public.waiting_players
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can leave waiting queue"
ON public.waiting_players
FOR DELETE
USING (true);

-- Lucky block entries - allow anyone
CREATE POLICY "Anyone can create entries"
ON public.lucky_block_entries
FOR INSERT
WITH CHECK (true);

-- Add spectators table for watching games
CREATE TABLE IF NOT EXISTS public.game_spectators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE public.game_spectators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spectators"
ON public.game_spectators
FOR SELECT
USING (true);

CREATE POLICY "Anyone can join as spectator"
ON public.game_spectators
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can leave as spectator"
ON public.game_spectators
FOR DELETE
USING (true);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_spectators;