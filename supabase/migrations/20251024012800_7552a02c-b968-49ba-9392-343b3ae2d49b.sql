-- Add profile fields and statistics tables

-- Extend User table with profile info
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS total_wagered NUMERIC DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS total_won NUMERIC DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0;

-- Create global statistics table
CREATE TABLE IF NOT EXISTS public.global_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_wagers_placed BIGINT DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  total_players BIGINT DEFAULT 0,
  solana_online INTEGER DEFAULT 0,
  base_online INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats
INSERT INTO public.global_stats (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS on global_stats
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read global stats
CREATE POLICY "Anyone can view global stats" ON public.global_stats
  FOR SELECT USING (true);

-- Service role can update stats
CREATE POLICY "Service role can update stats" ON public.global_stats
  FOR UPDATE USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Enable realtime for global stats
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_stats;
ALTER TABLE public.global_stats REPLICA IDENTITY FULL;

-- Function to increment wager count
CREATE OR REPLACE FUNCTION increment_wager_stats(wager_amt NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE global_stats
  SET 
    total_wagers_placed = total_wagers_placed + 1,
    total_volume = total_volume + wager_amt,
    updated_at = NOW();
END;
$$;

-- Function to update online user count
CREATE OR REPLACE FUNCTION update_online_count(network_name TEXT, count_change INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF network_name = 'solana' THEN
    UPDATE global_stats
    SET solana_online = GREATEST(0, solana_online + count_change);
  ELSIF network_name = 'base' THEN
    UPDATE global_stats
    SET base_online = GREATEST(0, base_online + count_change);
  END IF;
END;
$$;