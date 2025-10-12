# Message Expiration System - Migration Guide

## Overview

Your chat now supports message expiration:
- **Anonymous users**: Messages automatically expire and delete after 5 minutes
- **Authenticated users** (with wallet): Messages persist for 30 days
- **Anonymous users cannot create new channels** (only authenticated users can)

## Required Database Migration

You need to add the `expiresAt` column to your Supabase database. Follow these steps:

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project (`dpfuunbmiwdlmnlxpahk`)
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration SQL

Copy and paste this SQL into the editor:

```sql
-- Add expiresAt column to Message table
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
```

### Step 3: Execute the SQL

Click the **Run** button (or press Cmd/Ctrl + Enter)

You should see: `Success. No rows returned`

## Features

### 1. Message Expiration

#### Anonymous Users
- Messages expire 5 minutes after posting
- Automatically filtered out from GET requests
- Periodically deleted by cleanup script

#### Authenticated Users
- Messages expire 30 days after posting
- Long-term persistence for community building

### 2. Channel Creation Restriction

Anonymous users attempting to create a channel will receive:
```json
{
  "error": "Channel not found. Anonymous users cannot create channels. Please connect your wallet or use an existing channel.",
  "status": 403
}
```

### 3. Automatic Cleanup

Run the cleanup script periodically to remove expired messages:

```bash
npm run cleanup-messages
```

**Recommended**: Set up a cron job to run this every 5-10 minutes:

```bash
# Vercel Cron (add to vercel.json)
{
  "crons": [{
    "path": "/api/cleanup-messages",
    "schedule": "*/5 * * * *"
  }]
}

# Or system cron
*/5 * * * * cd /path/to/basement && npm run cleanup-messages
```

## Testing

### Test Anonymous User (5 min expiration)

```bash
curl -X POST "https://thebasement.wtf/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "anonymous",
    "content": "This will expire in 5 minutes",
    "channelSlug": "basement"
  }'
```

Check the response - it should include `expiresAt` timestamp 5 minutes in the future.

### Test Authenticated User (30 day expiration)

```bash
curl -X POST "https://thebasement.wtf/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "content": "This will expire in 30 days",
    "channelSlug": "basement"
  }'
```

Check the response - `expiresAt` should be 30 days in the future.

### Test Channel Creation Restriction

```bash
# Anonymous user - should fail
curl -X POST "https://thebasement.wtf/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "anonymous",
    "content": "Test",
    "channelSlug": "nonexistent-channel"
  }'
# Expected: 403 error

# Authenticated user - should succeed
curl -X POST "https://thebasement.wtf/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "content": "Test",
    "channelSlug": "new-channel"
  }'
# Expected: Success, channel created
```

## Monitoring

Check message expiration status:

```bash
# View messages expiring soon
SELECT id, content, "createdAt", "expiresAt", 
       ("expiresAt" - NOW()) as "time_until_expiration"
FROM "Message"
WHERE "expiresAt" IS NOT NULL
  AND "expiresAt" > NOW()
ORDER BY "expiresAt" ASC
LIMIT 10;
```

## Rollback (if needed)

If you need to rollback the changes:

```sql
ALTER TABLE "Message" DROP COLUMN IF EXISTS "expiresAt";
DROP INDEX IF EXISTS "Message_expiresAt_idx";
DROP FUNCTION IF EXISTS cleanup_expired_messages();
```

Then redeploy the previous version of the code.

