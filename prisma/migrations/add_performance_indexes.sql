-- PERFORMANCE OPTIMIZATION: Add critical missing indexes
-- Run this in Supabase SQL Editor for instant query speed improvements

-- Message table optimizations
CREATE INDEX IF NOT EXISTS "Message_createdAt_desc_idx" 
    ON "Message"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Message_channelId_createdAt_idx" 
    ON "Message"("channelId", "createdAt" DESC);

-- For loading recent messages (most common query)
CREATE INDEX IF NOT EXISTS "Message_channel_notDeleted_created_idx"
    ON "Message"("channelId", "isDeleted", "createdAt" DESC)
    WHERE "isDeleted" = false;

-- Channel optimizations
CREATE INDEX IF NOT EXISTS "Channel_private_created_idx"
    ON "Channel"("isPrivate", "createdAt" DESC);

-- User activity tracking
CREATE INDEX IF NOT EXISTS "User_lastSeenAt_idx"
    ON "User"("lastSeenAt" DESC);

CREATE INDEX IF NOT EXISTS "User_createdAt_idx"
    ON "User"("createdAt" DESC);

-- Transaction optimizations
CREATE INDEX IF NOT EXISTS "Transaction_status_created_idx"
    ON "Transaction"("status", "createdAt" DESC);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS "User_verified_idx"
    ON "User"("isVerified")
    WHERE "isVerified" = true;

-- Analyze tables for query planner
ANALYZE "Message";
ANALYZE "Channel";
ANALYZE "User";
ANALYZE "Transaction";

