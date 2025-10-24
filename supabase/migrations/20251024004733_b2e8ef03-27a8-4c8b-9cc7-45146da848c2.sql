-- Enable realtime for Message table
ALTER TABLE "Message" REPLICA IDENTITY FULL;

-- Add Message table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";

-- Create default channels if they don't exist
INSERT INTO "Channel" (id, name, slug, description, "createdBy", "isPrivate")
VALUES 
  (gen_random_uuid(), 'general', 'general', 'General discussion for all topics', 'system', false),
  (gen_random_uuid(), 'trading', 'trading', 'Crypto trading and market discussion', 'system', false),
  (gen_random_uuid(), 'arcade', 'arcade', 'Gaming and arcade talk', 'system', false)
ON CONFLICT (slug) DO NOTHING;