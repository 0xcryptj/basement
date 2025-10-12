# 🔧 Chat Troubleshooting Guide

## Messages Failing to Send? Follow These Steps:

### Step 1: Test Database Connection

Visit this URL in your browser:
```
https://your-domain.com/api/chat/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Chat API is working!",
  "database": {
    "connected": true,
    "tables": {
      "channels": 1,
      "users": 0,
      "messages": 0
    }
  }
}
```

**If you see an error:**
- ❌ Database is not connected
- ❌ Tables might not exist
- ❌ DATABASE_URL might be wrong

---

### Step 2: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try sending a message
5. Look for these logs:

**Client Side (Your Browser):**
```javascript
Sending message to server: { walletAddress: "0x123...", content: "test", channel: "#basement" }
Server response: { success: true, message: {...} }
✅ Message sent successfully: msg_abc123
```

**If you see errors:**
```javascript
❌ Error sending message: Failed to fetch
```
This means the API route isn't responding.

---

### Step 3: Check Vercel Logs

1. Go to https://vercel.com
2. Select your project
3. Click **Logs** tab
4. Look for:

**Good Logs:**
```
📨 POST /api/chat/messages - Request received
✅ Validation passed
👤 Creating new user: 0x123...
✅ User created: user_abc
📢 Channel exists: ch_basement
💬 Creating message...
✅ Message created: msg_xyz
```

**Bad Logs:**
```
❌ Error sending message: PrismaClientInitializationError
❌ Database connection failed
```

---

### Step 4: Common Issues & Fixes

#### Issue 1: "Failed to fetch"
**Cause:** API route not deployed or returning 404  
**Fix:**
1. Check if `/api/chat/messages/route.ts` exists
2. Run `npm run build` locally to check for errors
3. Redeploy to Vercel

#### Issue 2: "Database connection failed"
**Cause:** DATABASE_URL not set or incorrect  
**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `DATABASE_URL` is set
3. Should be: `postgresql://postgres:[password]@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres`
4. Click "Redeploy" after changing

#### Issue 3: "relation \"Channel\" does not exist"
**Cause:** Database tables not created  
**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `supabase/CREATE_ALL_TABLES.sql`
3. Then run `supabase/RUN_THIS_IN_SUPABASE.sql`

#### Issue 4: "Wallet address and content are required"
**Cause:** Frontend not sending wallet address  
**Fix:**
1. Make sure you're **connected** to your wallet
2. Check console: should see your wallet address
3. Refresh the page and reconnect

#### Issue 5: Messages send but don't appear
**Cause:** Polling might be broken or messages not fetching  
**Fix:**
1. Check console for polling errors
2. Manually refresh the page
3. Should load message history on page load

---

### Step 5: Manual Test via curl

Test the API directly:

```bash
curl -X POST https://your-domain.com/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "content": "Test message",
    "channelSlug": "basement"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_abc123",
    "content": "Test message",
    "createdAt": "2025-01-01T12:00:00Z",
    "user": {
      "username": "User_0x1234",
      "walletAddress": "0x1234..."
    }
  }
}
```

**If you get an error:**
```json
{
  "error": "Failed to send message",
  "details": "PrismaClientInitializationError: ...",
  "stack": "..."
}
```

Copy the error and check what it says!

---

### Step 6: Check Environment Variables

Make sure these are set in Vercel:

```bash
# Required
DATABASE_URL=postgresql://postgres:[password]@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres

# For Supabase features
NEXT_PUBLIC_SUPABASE_URL=https://dpfuunbmiwdlmnlxpahk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Optional (from before)
NEXT_PUBLIC_ADMIN_ADDRESSES=0x123...,0xabc...
```

After adding/changing env vars:
1. Click **Redeploy** in Vercel
2. Wait for deployment to finish
3. Test again

---

### Step 7: Verify Database Schema

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Channel', 'Message');

-- Should return 3 rows
```

**If tables don't exist:**
1. Go to `supabase/CREATE_ALL_TABLES.sql`
2. Copy all the SQL
3. Paste in Supabase SQL Editor
4. Click **Run**

---

### Step 8: Check Permissions

Make sure your Supabase user has permissions:

```sql
-- Check if you can insert
INSERT INTO "Channel" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), '#test', 'test', 'Test channel', NOW(), NOW());

-- If this works, your permissions are fine
-- Clean up:
DELETE FROM "Channel" WHERE slug = 'test';
```

---

## 🐛 Debug Mode

Add this to your browser console to see detailed logs:

```javascript
// Enable verbose logging
localStorage.setItem('basement_debug', 'true');

// Then refresh the page and try sending a message
// You'll see EVERYTHING logged
```

---

## 📞 Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Take a screenshot** of:
   - Browser console (F12)
   - Vercel logs
   - Supabase SQL Editor showing tables

2. **Share the error message** - what does it say exactly?

3. **Test the test endpoint** - what does `/api/chat/test` return?

4. **Check if other APIs work** - does `/api/forum/health` work?

---

## ✅ Success Checklist

- [ ] `/api/chat/test` returns `success: true`
- [ ] Browser console shows "📨 Sending message to server"
- [ ] Browser console shows "✅ Message sent successfully"
- [ ] Vercel logs show "✅ Message created: msg_..."
- [ ] Message appears in chat window
- [ ] Other user sees the message within 3 seconds

If all checked ✅ - **CHAT IS WORKING!** 🎉

---

## 🔍 Quick Diagnostics

Run this in browser console:

```javascript
// Test 1: Check if API exists
fetch('/api/chat/test').then(r => r.json()).then(console.log);

// Test 2: Check wallet connection
console.log('Wallet:', window.app?.walletAddress);
console.log('Channel:', window.app?.currentChannel);

// Test 3: Send test message (after connecting wallet)
window.app?.sendMessage();
```

This will show you exactly where it's failing!

