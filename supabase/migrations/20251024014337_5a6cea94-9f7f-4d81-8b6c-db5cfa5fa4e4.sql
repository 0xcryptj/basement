-- Fix Message table foreign key to reference User table properly
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_userId_fkey";
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Create default channels if they don't exist
INSERT INTO "Channel" (id, name, slug, description, "isPrivate", "createdBy")
VALUES 
  (gen_random_uuid(), 'General', 'general', 'General discussion for all players', false, NULL),
  (gen_random_uuid(), 'War', 'war', 'War game chat', false, NULL),
  (gen_random_uuid(), 'Chess', 'chess', 'Chess game chat', false, NULL),
  (gen_random_uuid(), 'Connect4', 'connect4', 'Connect4 game chat', false, NULL),
  (gen_random_uuid(), 'Coin Toss', 'cointoss', 'Coin Toss game chat', false, NULL),
  (gen_random_uuid(), 'Lucky Block', 'luckyblock', 'Lucky Block game chat', false, NULL)
ON CONFLICT DO NOTHING;