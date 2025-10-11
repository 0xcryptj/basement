-- ========================================
-- COMPLETE SUPABASE SETUP - RUN THIS ONCE
-- ========================================
-- 
-- Instructions:
-- 1. Go to https://dpfuunbmiwdlmnlxpahk.supabase.co
-- 2. Click "SQL Editor" in left sidebar
-- 3. Click "New query"
-- 4. Copy and paste THIS ENTIRE FILE
-- 5. Click "Run" or press Ctrl+Enter
-- 6. Wait for "Success" message
-- 
-- This will:
-- - Enable Row Level Security on all tables
-- - Set up public read access for forum/chat
-- - Restrict writes to API only (service role)
-- - Add performance indexes
-- - Create message cleanup function
-- ========================================

-- ========================================
-- PART 1: FORUM TABLES RLS
-- ========================================

-- Enable RLS on forum tables
ALTER TABLE "Board" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ban" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public read boards" ON "Board";
DROP POLICY IF EXISTS "Public read threads" ON "Thread";
DROP POLICY IF EXISTS "Public read posts" ON "Post";
DROP POLICY IF EXISTS "Service role write boards" ON "Board";
DROP POLICY IF EXISTS "Service role write threads" ON "Thread";
DROP POLICY IF EXISTS "Service role write posts" ON "Post";
DROP POLICY IF EXISTS "Service role only admins" ON "Admin";
DROP POLICY IF EXISTS "Service role only bans" ON "Ban";
DROP POLICY IF EXISTS "Service role only votes" ON "Vote";

-- Public READ access to boards, threads, and posts
CREATE POLICY "Public read boards"
ON "Board" FOR SELECT
USING (true);

CREATE POLICY "Public read threads"
ON "Thread" FOR SELECT
USING (true);

CREATE POLICY "Public read posts"
ON "Post" FOR SELECT
USING (true);

-- Service role can do everything (API controls writes)
CREATE POLICY "Service role write boards"
ON "Board" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write threads"
ON "Thread" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write posts"
ON "Post" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role only votes"
ON "Vote" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin and Ban tables - service role only
CREATE POLICY "Service role only admins"
ON "Admin" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role only bans"
ON "Ban" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ========================================
-- PART 2: USER & CHAT TABLES RLS
-- ========================================

-- Enable RLS on user/chat tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read users" ON "User";
DROP POLICY IF EXISTS "Public read channels" ON "Channel";
DROP POLICY IF EXISTS "Public read messages" ON "Message";
DROP POLICY IF EXISTS "Service role full access users" ON "User";
DROP POLICY IF EXISTS "Service role full access channels" ON "Channel";
DROP POLICY IF EXISTS "Service role full access members" ON "ChannelMember";
DROP POLICY IF EXISTS "Service role full access messages" ON "Message";
DROP POLICY IF EXISTS "Service role full access transactions" ON "Transaction";

-- User table policies
CREATE POLICY "Public read users"
ON "User" FOR SELECT
USING (true);

CREATE POLICY "Service role full access users"
ON "User" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Channel table policies (public channels only)
CREATE POLICY "Public read channels"
ON "Channel" FOR SELECT
USING ("isPrivate" = false OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access channels"
ON "Channel" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ChannelMember policies
CREATE POLICY "Service role full access members"
ON "ChannelMember" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Message policies (public channels only)
CREATE POLICY "Public read messages"
ON "Message" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Channel"
    WHERE "Channel".id = "Message"."channelId"
    AND ("Channel"."isPrivate" = false OR auth.jwt() ->> 'role' = 'service_role')
  )
);

CREATE POLICY "Service role full access messages"
ON "Message" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Transaction policies (private - service role only)
CREATE POLICY "Service role full access transactions"
ON "Transaction" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ========================================
-- PART 3: MESSAGE CLEANUP FUNCTION
-- ========================================

-- Auto-cleanup function for old messages (30-day retention)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Soft delete messages older than 30 days
  UPDATE "Message"
  SET "isDeleted" = true,
      "content" = '[Message deleted due to retention policy]',
      "imageUrl" = null
  WHERE "createdAt" < NOW() - INTERVAL '30 days'
  AND "isDeleted" = false;
  
  -- Hard delete very old messages (60+ days)
  DELETE FROM "Message"
  WHERE "createdAt" < NOW() - INTERVAL '60 days'
  AND "isDeleted" = true;
END;
$$;

-- ========================================
-- PART 4: PERFORMANCE INDEXES
-- ========================================

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_message_created_deleted" 
ON "Message"("createdAt", "isDeleted");

CREATE INDEX IF NOT EXISTS "idx_transaction_user_created" 
ON "Transaction"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_user_wallet" 
ON "User"("walletAddress");

CREATE INDEX IF NOT EXISTS "idx_thread_views" 
ON "Thread"("views" DESC);

-- ========================================
-- DONE! Your Supabase database is now secure and optimized!
-- ========================================

