# 🚨 DATABASE NOT CONNECTED - FIX NOW

## The Problem
Your API is returning **500 errors** because the database isn't connected.

```
api/chat/channels:1  Failed to load resource: the server responded with a status of 500 ()
api/chat/messages:1  Failed to load resource: the server responded with a status of 500 ()
```

---

## Quick Fix - Add DATABASE_URL to Vercel

### Step 1: Get Your Database URL
Your Supabase credentials:
```
Project: dpfuunbmiwdlmnlxpahk
Password: 3NNPfu2FSWu9h5IJ
```

**Full DATABASE_URL:**
```
postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres
```

### Step 2: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Click your project (basement)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**

**Add these variables:**

```bash
# REQUIRED - Database Connection
DATABASE_URL=postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres

# REQUIRED - Supabase Public URL
NEXT_PUBLIC_SUPABASE_URL=https://dpfuunbmiwdlmnlxpahk.supabase.co

# REQUIRED - Supabase Anon Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0

# REQUIRED - Supabase Service Role Key (secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA

# Optional - Admin wallet addresses (comma separated)
NEXT_PUBLIC_ADMIN_ADDRESSES=your_wallet_address_here
```

### Step 3: Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Wait for deployment to finish (~2 minutes)

---

## Verify It Works

After redeploying, visit:
```
https://your-domain.com/api/chat/test
```

**Should return:**
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

**If still failing:**
Check Vercel logs (Deployments → View Function Logs)

---

## Other Issues to Fix

### 1. CSP Manifest Error
**Fix:** In `vercel.json`, update CSP to allow manifest:

```json
"key": "Content-Security-Policy",
"value": "default-src 'self'; manifest-src 'self' data:; ..."
```

### 2. Mobile Only Sees #basement
**Cause:** `fetchChannels()` is failing (500 error)
**Fix:** Once DATABASE_URL is added, all channels will sync

### 3. No User Join Notifications
**Need to add:** User join/leave messages in chat
Will implement after database is connected

---

## Priority Order:

1. ✅ **ADD DATABASE_URL TO VERCEL** ← DO THIS FIRST!
2. ✅ **REDEPLOY**
3. ✅ Test `/api/chat/test`
4. ✅ Try sending message
5. ✅ Check if channels sync

Everything else is blocked by the database not being connected!

---

## Quick Copy-Paste for Vercel:

**Variable Name:** `DATABASE_URL`  
**Value:** `postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres`

**Variable Name:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://dpfuunbmiwdlmnlxpahk.supabase.co`

**Variable Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0`

**Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA`

---

**DO THIS NOW AND EVERYTHING WILL WORK! 🚀**

