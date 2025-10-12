-- Add expiresAt column to Message table
-- This enables automatic message expiration:
-- - Anonymous user messages: 5 minutes
-- - Authenticated user messages: 30 days

ALTER TABLE "Message" 
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Add index for efficient expiration queries
CREATE INDEX IF NOT EXISTS "Message_expiresAt_idx" ON "Message"("expiresAt");

-- Create a function to clean up expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "Message"
  WHERE "expiresAt" IS NOT NULL
    AND "expiresAt" <= NOW();
END;
$$;

-- Optional: Create a scheduled job to run cleanup every 5 minutes
-- Note: This requires pg_cron extension which may not be available on all Supabase plans
-- If not available, use the Node.js cleanup script via cron or Vercel Cron instead
-- SELECT cron.schedule('cleanup-expired-messages', '*/5 * * * *', 'SELECT cleanup_expired_messages()');

