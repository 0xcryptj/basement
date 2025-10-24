-- Clean up orphaned records in waiting_players first
DELETE FROM waiting_players
WHERE user_id NOT IN (SELECT id FROM "User");

-- Fix foreign key constraint on existing Message table
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_userId_fkey";
ALTER TABLE "Message"
  ADD CONSTRAINT "Message_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "User"(id)
  ON DELETE CASCADE;

-- Update waiting_players to use user_id that references User(id)
ALTER TABLE waiting_players DROP CONSTRAINT IF EXISTS waiting_players_user_id_fkey;
ALTER TABLE waiting_players
  ADD CONSTRAINT waiting_players_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES "User"(id)
  ON DELETE CASCADE;