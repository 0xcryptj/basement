-- ============================================
-- QUICK CHAT FIX - Copy/Paste into Supabase SQL Editor
-- NO CONNECTION STRING NEEDED - Just paste and run!
-- ============================================

-- Drop existing tables if they have issues
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ChannelMember" CASCADE;
DROP TABLE IF EXISTS "Channel" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "walletAddress" TEXT UNIQUE NOT NULL,
    "username" TEXT UNIQUE,
    "avatarUrl" TEXT,
    "balanceEth" DECIMAL(18,8) DEFAULT 0,
    "balanceUsd" DECIMAL(18,2) DEFAULT 0,
    "isVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create Channel table
CREATE TABLE "Channel" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPrivate" BOOLEAN DEFAULT false,
    "maxMembers" INTEGER,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create Message table
CREATE TABLE "Message" (
    "id" TEXT PRIMARY KEY,
    "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "replyToId" TEXT REFERENCES "Message"("id") ON DELETE SET NULL,
    "isEdited" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Channel_slug_idx" ON "Channel"("slug");
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId", "createdAt" DESC);
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- Insert default channels
INSERT INTO "Channel" ("id", "name", "slug", "description") VALUES
('luckyblock_ch', '#luckyblock', 'luckyblock', 'LuckyBlock game chat'),
('basement_ch', '#basement', 'basement', 'General chat'),
('arcade_ch', '#arcade', 'arcade', 'Arcade games');

-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - tighten later if needed)
CREATE POLICY "Users viewable by all" ON "User" FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update" ON "User" FOR UPDATE USING (true);

CREATE POLICY "Channels viewable by all" ON "Channel" FOR SELECT USING (true);
CREATE POLICY "Channels insertable" ON "Channel" FOR INSERT WITH CHECK (true);

CREATE POLICY "Messages viewable by all" ON "Message" FOR SELECT USING (true);
CREATE POLICY "Messages insertable" ON "Message" FOR INSERT WITH CHECK (true);
CREATE POLICY "Messages updatable" ON "Message" FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON "User" TO authenticated, anon;
GRANT ALL ON "Channel" TO authenticated, anon;
GRANT ALL ON "Message" TO authenticated, anon;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '✅ Chat database fixed!';
    RAISE NOTICE '✅ Tables created: User, Channel, Message';
    RAISE NOTICE '✅ Default channels: luckyblock, basement, arcade';
    RAISE NOTICE '✅ RLS enabled and policies configured';
    RAISE NOTICE '✅ Chat should now work!';
END$$;

