# 🚀 Next Steps for Deployment

## ✅ Completed

- [x] Vercel CLI installed and authenticated
- [x] Security audit completed (XSS, SQL injection, rate limiting)
- [x] Supabase storage adapter created
- [x] Row Level Security policies prepared
- [x] Environment configuration templates created
- [x] Security headers configured
- [x] Code committed to GitHub

---

## 🎯 Action Items (Manual Steps Required)

### 1. Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New project"
3. Choose a project name (e.g., "basement-forum")
4. **Important:** Choose a strong database password and save it
5. Select region (closest to your users)
6. Wait for project initialization (~2 minutes)

### 2. Configure Supabase Database (10 minutes)

#### Get Connection Strings
1. In Supabase dashboard, go to **Settings > Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Also copy the **Direct connection string** (for Prisma)

#### Run Database Migration
```bash
# Create .env file
cp .env.example .env

# Edit .env and add:
# - DATABASE_URL=<your connection string>
# - DIRECT_URL=<your direct connection string>

# Run Prisma migration
npm run db:push

# Seed initial data (boards, etc.)
npm run db:seed
```

#### Apply Row Level Security
1. Go to **SQL Editor** in Supabase
2. Open `supabase/migrations/001_row_level_security.sql`
3. Copy and paste the entire SQL content
4. Click **Run**

### 3. Set Up Image Storage (5 minutes)

#### Create Storage Bucket
1. Go to **Storage** in Supabase
2. Click "New bucket"
3. Name: `forum-images`
4. Make it **Public**
5. Click "Create bucket"

#### Apply Storage Policies
1. Go to **SQL Editor**
2. Open `supabase/storage_policies.sql`
3. Copy and paste the SQL content
4. Click **Run**

### 4. Configure Supabase API Keys

1. Go to **Settings > API** in Supabase
2. Copy these values to your `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
3. **Important:** Keep the service role key secret!

### 5. Configure Environment Variables

Edit `.env` and fill in ALL values:

```env
# Generate a random string for SERVER_SALT
SERVER_SALT="$(openssl rand -hex 32)"

# Your admin wallet address
ADMIN_WALLETS="0xYourWalletAddress"

# Production URL (update after deployment)
NEXT_PUBLIC_URL="https://your-app.vercel.app"

# Storage bucket name
NEXT_PUBLIC_STORAGE_BUCKET="forum-images"
```

### 6. Test Locally (5 minutes)

```bash
# Install dependencies
npm install

# Test development server
npm run dev

# Open http://localhost:8000
# Try creating a thread with an image
# Test forum features
```

### 7. Deploy to Vercel (10 minutes)

#### Link Project
```bash
vercel link
```

Choose:
- **Scope:** Your account
- **Link to existing project:** No (create new)
- **Project name:** `basement` or `the-basement`

#### Add Environment Variables to Vercel

**Option A: Via CLI**
```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SERVER_SALT production
vercel env add ADMIN_WALLETS production
vercel env add NEXT_PUBLIC_BASE_RPC_URL production
vercel env add NEXT_PUBLIC_STORAGE_BUCKET production
```

**Option B: Via Dashboard** (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings > Environment Variables**
4. Add all variables from your `.env` file
5. Select **Production** for each variable

#### Deploy
```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy if connected to Git)
git checkout main
git merge dev
git push origin main
```

### 8. Post-Deployment Testing (10 minutes)

1. Visit your production URL
2. Test wallet connection
3. Create a test thread
4. Upload an image
5. Test reply functionality
6. Test moderation tools (if admin)
7. Check browser console for errors

### 9. Enable Storage in API Routes

Update `lib/forum/storage.ts` to use Supabase:

```typescript
// Replace local storage with Supabase
import * as SupabaseStorage from './storage-supabase';

export const uploadImageWithThumb = SupabaseStorage.uploadImageWithThumb;
export const deleteImage = SupabaseStorage.deleteImage;
export const validateImage = SupabaseStorage.validateImage;
```

Or create a config flag:
```typescript
const USE_SUPABASE = process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined;

export const uploadImageWithThumb = USE_SUPABASE 
  ? SupabaseStorage.uploadImageWithThumb 
  : LocalStorage.uploadImageWithThumb;
```

---

## 📋 Production Checklist

Before going live:

### Security
- [ ] Generated strong `SERVER_SALT`
- [ ] Added admin wallet addresses
- [ ] Verified RLS policies are active
- [ ] Tested image upload security
- [ ] Reviewed rate limiting settings
- [ ] Checked that `.env` is in `.gitignore`

### Performance
- [ ] Tested with real user load
- [ ] Verified image optimization
- [ ] Checked database query performance
- [ ] Enabled Vercel Analytics (optional)

### Functionality
- [ ] All forum features working
- [ ] Image uploads successful
- [ ] Mod tools accessible
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Monitoring
- [ ] Set up Supabase alerts
- [ ] Monitor Vercel logs
- [ ] Check error rates
- [ ] Review usage metrics

---

## 🆘 Common Issues

### "Could not connect to database"
- Verify `DATABASE_URL` is correct
- Check database password
- Ensure IP is allowed in Supabase (should be automatic)

### "Storage bucket not found"
- Create `forum-images` bucket in Supabase
- Verify bucket is public
- Check `NEXT_PUBLIC_STORAGE_BUCKET` env var

### "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Try building locally: `npm run build`

### Images not uploading
- Check Supabase storage policies
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Test with smaller image first

---

## 📊 Cost Estimates

### Supabase (Free Tier)
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ Unlimited API requests
- **Perfect for MVP and small communities**

### Vercel (Hobby Plan)
- ✅ 100GB bandwidth
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- **Great for most projects**

### When to Upgrade
- Database > 500MB → Supabase Pro ($25/mo)
- Storage > 1GB → Supabase Pro
- Traffic > 100GB → Vercel Pro ($20/mo)

---

## 🎉 You're Ready!

Your project has been thoroughly audited and is ready for production deployment with:

1. ✅ **Secure backend** (Supabase PostgreSQL with RLS)
2. ✅ **XSS protection** (HTML entity escaping)
3. ✅ **SQL injection protection** (Prisma ORM)
4. ✅ **Rate limiting** (spam prevention)
5. ✅ **Image validation** (size, type, dimensions)
6. ✅ **Admin authentication** (wallet-based)
7. ✅ **Security headers** (Vercel configuration)
8. ✅ **CDN delivery** (Supabase storage + Vercel)

**Good luck with your launch! 🚀**

---

## 📖 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

**Need help?** Check `DEPLOYMENT_SECURITY_GUIDE.md` for detailed instructions.

