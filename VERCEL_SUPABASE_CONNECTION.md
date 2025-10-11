# 🔗 Connecting Supabase to Vercel

## Quick Setup (Choose One Method)

---

## Method 1: Vercel Dashboard (Easiest - Recommended) ⭐

### Step 1: Go to Vercel Dashboard
1. Open [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **basement** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add ALL These Variables

Click **"Add New"** for each of these:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dpfuunbmiwdlmnlxpahk.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA` | Production |
| `DATABASE_URL` | `postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production |
| `DIRECT_URL` | `postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres` | Production |
| `NODE_ENV` | `production` | Production |
| `SERVER_SALT` | `basement_crypto_2024_change_me` | Production |
| `ADMIN_WALLETS` | Your wallet address (e.g., `0x123...`) | Production |
| `NEXT_PUBLIC_BASE_RPC_URL` | `https://mainnet.base.org` | Production, Preview, Development |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `forum-images` | Production, Preview, Development |
| `CHAT_RETENTION_DAYS` | `30` | Production |

### Step 3: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Select **"Use existing Build Cache"** (unchecked)
5. Click **"Redeploy"**

---

## Method 2: Vercel CLI (Automated)

**Note:** Replace `0xYourWalletAddressHere` with your actual wallet address first!

Then run:

```bash
# IMPORTANT: Edit ADMIN_WALLETS value first!
# Then run these commands one by one:

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, paste: https://dpfuunbmiwdlmnlxpahk.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA

vercel env add DATABASE_URL production
# Paste: postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

vercel env add DIRECT_URL production
# Paste: postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres

vercel env add SERVER_SALT production
# Paste: basement_crypto_2024_change_me

vercel env add ADMIN_WALLETS production
# Paste: 0xYourActualWalletAddress

vercel env add NEXT_PUBLIC_BASE_RPC_URL production
# Paste: https://mainnet.base.org

vercel env add NEXT_PUBLIC_STORAGE_BUCKET production
# Paste: forum-images

vercel env add CHAT_RETENTION_DAYS production
# Paste: 30

# Then redeploy
vercel --prod
```

---

## 🔗 Vercel + Supabase Integration (Optional but Recommended)

### Enable Supabase Integration in Vercel

1. Go to [https://vercel.com/integrations/supabase](https://vercel.com/integrations/supabase)
2. Click **"Add Integration"**
3. Select your Vercel account
4. Select your **basement** project
5. **Sign in to Supabase** when prompted
6. Select your **basement** Supabase project
7. Click **"Connect"**

**Benefits:**
- ✅ Automatic environment variable syncing
- ✅ Database insights in Vercel dashboard
- ✅ Easier management
- ✅ Build-time optimizations

---

## 📝 Important: Run Supabase SQL Migrations

You MUST run these SQL scripts in Supabase for everything to work:

### In Supabase SQL Editor:

#### Migration 1: Forum RLS Policies
```bash
# File: supabase/migrations/001_row_level_security.sql
```
Copy the entire content and run it in Supabase SQL Editor.

#### Migration 2: Chat & User RLS Policies
```bash
# File: supabase/migrations/002_chat_and_users_rls.sql
```
Copy the entire content and run it in Supabase SQL Editor.

#### Storage Policies
```bash
# File: supabase/storage_policies.sql  
```
Copy and run this AFTER creating the `forum-images` bucket.

---

## 🎯 Deployment Checklist

Before your first production deployment:

- [ ] ✅ Code pushed to GitHub (main branch)
- [ ] ⏳ All environment variables added to Vercel
- [ ] ⏳ RLS migrations run in Supabase SQL Editor
- [ ] ⏳ `forum-images` storage bucket created
- [ ] ⏳ Storage policies applied
- [ ] ⏳ Admin wallet address configured
- [ ] ⏳ Redeploy triggered in Vercel

After these steps, your build will succeed! ✅

---

## 🆘 If Build Still Fails

### Check Build Logs
1. Go to Vercel dashboard
2. Click on the failed deployment
3. Look for specific error messages

### Common Issues

**"Could not connect to database"**
- Verify `DATABASE_URL` is correct in Vercel env vars
- Check password has no typos
- Ensure Vercel IP is allowed (should be automatic)

**"Module not found: @types/formidable"**
- This is now fixed in the latest commit
- Make sure Vercel is deploying from `main` branch
- Try "Redeploy" without cache

**"Prisma client not generated"**
- Add `postinstall` script to package.json (already done)
- Vercel should run `prisma generate` automatically

---

## 📱 Next: Deploy!

Choose your preferred method above and add the environment variables to Vercel. Once done, your deployment will succeed! 🎉

