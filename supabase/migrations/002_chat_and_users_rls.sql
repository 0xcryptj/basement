-- Row Level Security for User, Channel, Message, and Transaction tables

-- Enable RLS on new tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read users" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Public read channels" ON "Channel";
DROP POLICY IF EXISTS "Public read messages" ON "Message";
DROP POLICY IF EXISTS "Users can read own transactions" ON "Transaction";
DROP POLICY IF EXISTS "Service role full access users" ON "User";
DROP POLICY IF EXISTS "Service role full access channels" ON "Channel";
DROP POLICY IF EXISTS "Service role full access members" ON "ChannelMember";
DROP POLICY IF EXISTS "Service role full access messages" ON "Message";
DROP POLICY IF EXISTS "Service role full access transactions" ON "Transaction";

-- User table policies
-- Public can read basic user profiles (for display names, etc.)
CREATE POLICY "Public read users"
ON "User" FOR SELECT
USING (true);

-- Service role has full access (API routes control writes)
CREATE POLICY "Service role full access users"
ON "User" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Channel table policies
-- Public can read public channels
CREATE POLICY "Public read channels"
ON "Channel" FOR SELECT
USING (isPrivate = false OR auth.jwt() ->> 'role' = 'service_role');

-- Service role has full access
CREATE POLICY "Service role full access channels"
ON "Channel" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ChannelMember table policies
-- Service role has full access
CREATE POLICY "Service role full access members"
ON "ChannelMember" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Message table policies
-- Public can read messages in public channels
CREATE POLICY "Public read messages"
ON "Message" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Channel"
    WHERE "Channel".id = "Message"."channelId"
    AND ("Channel"."isPrivate" = false OR auth.jwt() ->> 'role' = 'service_role')
  )
);

-- Service role has full access
CREATE POLICY "Service role full access messages"
ON "Message" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Transaction table policies
-- Service role only (sensitive financial data)
CREATE POLICY "Service role full access transactions"
ON "Transaction" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Auto-cleanup function for old messages (30-day retention)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete messages older than CHAT_RETENTION_DAYS
  DELETE FROM "Message"
  WHERE "createdAt" < NOW() - INTERVAL '30 days'
  AND "isDeleted" = false;
  
  -- Mark very old messages as deleted instead of hard delete
  -- (preserves thread integrity)
  UPDATE "Message"
  SET "isDeleted" = true
  WHERE "createdAt" < NOW() - INTERVAL '60 days'
  AND "isDeleted" = false;
END;
$$;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- You can run this manually or set up a cron job
-- SELECT cleanup_old_messages();

-- Optional: Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_message_created_deleted" ON "Message"("createdAt", "isDeleted");
CREATE INDEX IF NOT EXISTS "idx_transaction_user_created" ON "Transaction"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_user_wallet" ON "User"("walletAddress");

