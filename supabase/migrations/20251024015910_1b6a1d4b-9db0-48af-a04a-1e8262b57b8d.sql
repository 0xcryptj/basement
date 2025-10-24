-- Create waiting_players table for matchmaking visibility
CREATE TABLE IF NOT EXISTS public.waiting_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  network text NOT NULL,
  wager_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waiting_players ENABLE ROW LEVEL SECURITY;

-- Anyone can view waiting players
CREATE POLICY "Anyone can view waiting players"
ON public.waiting_players
FOR SELECT
USING (true);

-- Users can add themselves to queue
CREATE POLICY "Users can join queue"
ON public.waiting_players
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can remove themselves from queue
CREATE POLICY "Users can leave queue"
ON public.waiting_players
FOR DELETE
USING (auth.uid()::text = user_id);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_players;