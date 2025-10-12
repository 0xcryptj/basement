# 🔧 FIX: DATABASE_URL for Supabase

## ❌ Current Error:
```
FATAL: Tenant or user not found
```

This means your DATABASE_URL format is wrong for Supabase serverless.

---

## ✅ THE CORRECT DATABASE_URL

### Option 1: Pooler URL (RECOMMENDED for Vercel)

```
postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Option 2: Direct Connection with Pooler Flag

```
postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

---

## 📋 How to Get the Correct URL from Supabase:

1. Go to https://supabase.com/dashboard/project/dpfuunbmiwdlmnlxpahk
2. Click **Settings** (gear icon) → **Database**
3. Scroll down to **Connection string** section
4. Click **"Connection pooling"** tab (NOT Session mode!)
5. Copy the **URI** string
6. Replace `[YOUR-PASSWORD]` with: `3NNPfu2FSWu9h5IJ`

---

## 🔄 Update in Vercel:

1. Go to https://vercel.com/dashboard
2. Click your project
3. **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and click **Edit**
5. Paste the new URL from above
6. Click **Save**
7. Go to **Deployments** tab
8. Click **...** on latest deployment → **Redeploy**
9. Wait 2 minutes

---

## ✅ Verify It Works:

After redeploying, visit:
```
https://your-domain.com/api/chat/test
```

Should return:
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

---

## 🎯 What Changes:

**Before (WRONG):**
```
postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres
```
❌ Direct connection - doesn't work with serverless
❌ Wrong format for connection pooling

**After (CORRECT):**
```
postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```
✅ Uses Supabase pooler
✅ Correct format for serverless (Vercel)
✅ Port 6543 for pooler (not 5432)

---

## 🔍 Why This Matters:

Supabase has TWO connection modes:

1. **Direct Connection (Session mode)** - Port 5432
   - For long-running servers
   - NOT for serverless (Vercel)

2. **Connection Pooling (Transaction mode)** - Port 6543
   - For serverless functions
   - Required for Vercel/Netlify
   - This is what you need!

---

**Use the pooler URL and messages will work immediately!** 🚀

