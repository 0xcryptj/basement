# 🚀 Easy 3-Step Deployment Guide

## The Easiest Way - Vercel Dashboard (5 minutes)

### Step 1: Import Your GitHub Repo to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Find **"0xcryptj/basement"** in the list
4. Click **"Import"**
5. On the configure screen:
   - **Project Name:** `basement` (or whatever you want)
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `basement` ⚠️ IMPORTANT! Click "Edit" and type: `basement`
   - **Build Command:** `npm run build` (should be pre-filled)
   - **Output Directory:** `.next` (should be pre-filled)

### Step 2: Add Environment Variables (Click "Environment Variables")

Before clicking "Deploy", expand the **Environment Variables** section and add these **11 variables**:

Copy/paste each one:

```
NEXT_PUBLIC_SUPABASE_URL
https://dpfuunbmiwdlmnlxpahk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk0OTQsImV4cCI6MjA3NTc1NTQ5NH0.eqfGpQ9BW-nBaTR9pGglbsd26JSZvkJjsyZqZJh2pd0

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnV1bmJtaXdkbG1ubHhwYWhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE3OTQ5NCwiZXhwIjoyMDc1NzU1NDk0fQ.p5BsoZm9edQo7yI60iiT0giJLimOp2zv97Cnsi1wbdA

DATABASE_URL
postgresql://postgres.dpfuunbmiwdlmnlxpahk:3NNPfu2FSWu9h5IJ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL
postgresql://postgres:3NNPfu2FSWu9h5IJ@db.dpfuunbmiwdlmnlxpahk.supabase.co:5432/postgres

NODE_ENV
production

SERVER_SALT
basement_crypto_salt_2024_CHANGE_THIS_LATER

ADMIN_WALLETS
0xYourWalletAddressHere

NEXT_PUBLIC_BASE_RPC_URL
https://mainnet.base.org

NEXT_PUBLIC_STORAGE_BUCKET
forum-images

CHAT_RETENTION_DAYS
30
```

### Step 3: Click "Deploy"!

That's it! Vercel will:
1. ✅ Clone your repo
2. ✅ Install dependencies (including @types/formidable)
3. ✅ Generate Prisma client
4. ✅ Build your Next.js app
5. ✅ Deploy to production

---

## 🔧 After First Deployment

### A. Set Up Supabase Tables (One-Time Setup)

You need to run these SQL scripts in Supabase:

1. Go to **https://dpfuunbmiwdlmnlxpahk.supabase.co**
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**

**Run these 2 scripts one at a time:**

#### Script 1: Forum Tables RLS
Open file: `supabase/migrations/001_row_level_security.sql`
- Copy ALL the SQL
- Paste into SQL Editor
- Click **"Run"** or press `Ctrl+Enter`
- Should see "Success"

#### Script 2: User & Chat Tables RLS  
Open file: `supabase/migrations/002_chat_and_users_rls.sql`
- Copy ALL the SQL
- Paste into SQL Editor  
- Click **"Run"**
- Should see "Success"

### B. Create Storage Bucket

1. In Supabase, go to **"Storage"** (left sidebar)
2. Click **"Create a new bucket"**
3. **Name:** `forum-images`
4. **Public bucket:** Toggle **ON** ✅
5. Click **"Create bucket"**

6. Click on `forum-images` bucket
7. Go to **"Policies"** tab
8. Click **"New policy"** → "For full customization"
9. Copy/paste policies from `supabase/storage_policies.sql`
10. Click **"Save policy"**

### C. Update Your Admin Wallet

1. Go back to Vercel dashboard
2. Your project → **Settings** → **Environment Variables**
3. Find `ADMIN_WALLETS`
4. Click **"Edit"**
5. Replace `0xYourWalletAddressHere` with YOUR actual wallet address
6. Save

---

## 🎉 You're Live!

After these steps, your app will be fully functional with:

✅ Supabase backend connected
✅ User profiles with ETH/USD balances
✅ 6 chat channels ready
✅ Forum system operational
✅ Image uploads to Supabase storage
✅ 30-day message retention
✅ Vercel Analytics enabled
✅ Speed Insights active

**Your production URL:** `https://your-project.vercel.app`

---

## 🔍 Verify Everything Works

After deployment:

1. Visit your production URL
2. Connect your wallet
3. Try posting in the forum
4. Upload an image
5. Check if it appears

---

## 📊 Monitor Your App

### Vercel Dashboard
- **Analytics:** See user traffic
- **Speed Insights:** Monitor performance
- **Logs:** Debug issues
- **Deployments:** View build history

### Supabase Dashboard
- **Table Editor:** View database data
- **Storage:** Check uploaded images
- **Logs:** Monitor database queries
- **Auth:** User authentication (if you enable it later)

---

## 🆘 Troubleshooting

### "Build failed: @types/formidable"
- Make sure you deployed from the **main** branch (latest code)
- Click "Redeploy" in Vercel
- Check that package.json includes `@types/formidable` in devDependencies

### "Database connection failed"
- Double-check DATABASE_URL in Vercel env vars
- Verify password has no typos
- Check that both DATABASE_URL and DIRECT_URL are set

### "Storage bucket not found"
- Create the `forum-images` bucket in Supabase
- Make sure it's set to PUBLIC
- Verify NEXT_PUBLIC_STORAGE_BUCKET=forum-images in Vercel

---

## 💡 Pro Tips

1. **Use the main branch** for production deployments
2. **Use the dev branch** for testing
3. **Enable automatic deployments** from GitHub in Vercel
4. **Set up domains** in Vercel Settings → Domains
5. **Monitor usage** to stay within free tier limits

---

**Ready to deploy? Follow the 3 steps above! 🚀**

Questions? Check:
- `SUPABASE_SETUP_COMPLETE.md` - Supabase setup guide
- `DEPLOYMENT_SECURITY_GUIDE.md` - Security details
- `NEXT_STEPS.md` - Full walkthrough

