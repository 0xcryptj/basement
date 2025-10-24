-- Create enum for game types
CREATE TYPE public.game_type AS ENUM ('war', 'chess', 'connect4', 'cointoss', 'luckyblock');

-- Create enum for match status
CREATE TYPE public.match_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');

-- Create enum for blockchain network
CREATE TYPE public.network_type AS ENUM ('solana', 'base');

-- Create matches table for multiplayer games
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type game_type NOT NULL,
  network network_type NOT NULL,
  player1_id TEXT REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
  player2_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  wager_amount NUMERIC NOT NULL,
  status match_status NOT NULL DEFAULT 'waiting',
  winner_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  game_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policies for matches
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid()::text = player1_id);

CREATE POLICY "Players can update their own matches" ON public.matches
  FOR UPDATE USING (
    auth.uid()::text = player1_id OR 
    auth.uid()::text = player2_id
  );

-- Create matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
  game_type game_type NOT NULL,
  network network_type NOT NULL,
  wager_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- Enable RLS on matchmaking_queue
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Policies for matchmaking_queue
CREATE POLICY "Anyone can view queue" ON public.matchmaking_queue
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join queue" ON public.matchmaking_queue
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can leave their own queue" ON public.matchmaking_queue
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create lucky block rounds table
CREATE TABLE public.lucky_block_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network network_type NOT NULL,
  pot_size NUMERIC NOT NULL DEFAULT 0,
  status match_status NOT NULL DEFAULT 'active',
  winner_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on lucky_block_rounds
ALTER TABLE public.lucky_block_rounds ENABLE ROW LEVEL SECURITY;

-- Policies for lucky_block_rounds
CREATE POLICY "Anyone can view rounds" ON public.lucky_block_rounds
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage rounds" ON public.lucky_block_rounds
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create lucky block entries table
CREATE TABLE public.lucky_block_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.lucky_block_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE NOT NULL,
  wager_amount NUMERIC NOT NULL,
  odds NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lucky_block_entries
ALTER TABLE public.lucky_block_entries ENABLE ROW LEVEL SECURITY;

-- Policies for lucky_block_entries
CREATE POLICY "Anyone can view entries" ON public.lucky_block_entries
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create entries" ON public.lucky_block_entries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lucky_block_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lucky_block_entries;

-- Set replica identity for realtime
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.matchmaking_queue REPLICA IDENTITY FULL;
ALTER TABLE public.lucky_block_rounds REPLICA IDENTITY FULL;
ALTER TABLE public.lucky_block_entries REPLICA IDENTITY FULL;