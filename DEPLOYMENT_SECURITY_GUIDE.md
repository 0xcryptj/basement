# Deployment & Security Guide

## 🔒 Security Audit Results

### ✅ Protections Already in Place

1. **SQL Injection Protection**
   - Using Prisma ORM with parameterized queries
   - No raw SQL queries in codebase
   - **Status: SECURE**

2. **XSS Protection**
   - HTML entities properly escaped in `lib/forum/sanitize.ts`
   - All user input sanitized before storage
   - DangerouslySetInnerHTML used only with sanitized content
   - **Status: SECURE**

3. **Rate Limiting**
   - Implemented in `lib/forum/ratelimit.ts`
   - Prevents spam and DoS attacks
   - **Status: SECURE**

4. **Input Validation**
   - File size limits enforced (5MB)
   - MIME type validation for images
   - Filename sanitization
   - **Status: SECURE**

5. **Authentication**
   - Wallet-based authentication
   - Admin role verification
   - Rotating anonymous IDs
   - **Status: SECURE**

### 🔧 Improvements Made

1. Created `.gitignore` to exclude sensitive files
2. Created `.env.example` template
3. Prepared Supabase migration scripts

---

## 🚀 Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Choose a secure database password
4. Wait for project initialization (~2 minutes)

### Step 2: Get Connection Strings

After project creation, go to **Settings > Database** and copy:
- Connection string (URI) 
- Direct connection string

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` - Your Supabase connection string
- `DIRECT_URL` - Your Supabase direct connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` - From Settings > API (keep secret!)
- `SERVER_SALT` - Generate a random string

### Step 4: Create Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed initial data
npm run db:seed
```

### Step 5: Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `forum-images`
3. Make it **public** for image serving
4. Set up policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'forum-images' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'forum-images' AND
  auth.role() = 'authenticated'
);
```

---

## 🛡️ Row Level Security (RLS) Policies

Run these SQL queries in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE "Board" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ban" ENABLE ROW LEVEL SECURITY;

-- Public read access to boards, threads, and posts
CREATE POLICY "Public read boards"
ON "Board" FOR SELECT
USING (true);

CREATE POLICY "Public read threads"
ON "Thread" FOR SELECT
USING (true);

CREATE POLICY "Public read posts"
ON "Post" FOR SELECT
USING (true);

-- Only service role can write (handled by API)
CREATE POLICY "Service role write boards"
ON "Board" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write threads"
ON "Thread" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role write posts"
ON "Post" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Admin and Ban tables - service role only
CREATE POLICY "Service role only admins"
ON "Admin" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role only bans"
ON "Ban" FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 🌐 Vercel Deployment

### Step 1: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 2: Link Project

```bash
vercel link
```

Choose:
- Set up and deploy: **Yes**
- Scope: Your account/team
- Link to existing project: **Create new project**
- Project name: **basement** or **the-basement**

### Step 3: Configure Environment Variables

```bash
# Add environment variables to Vercel
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

Or set them in Vercel dashboard: **Settings > Environment Variables**

### Step 4: Deploy

```bash
# Deploy to production
vercel --prod
```

---

## 🔐 Production Security Checklist

### Before Deployment

- [ ] Generate a strong random `SERVER_SALT`
- [ ] Add your admin wallet addresses to `ADMIN_WALLETS`
- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXT_PUBLIC_URL` to your production domain
- [ ] Verify all Supabase credentials are correct
- [ ] Test database connection locally

### After Deployment

- [ ] Test all forum features
- [ ] Verify image uploads work
- [ ] Test moderation tools
- [ ] Check that RLS policies are active
- [ ] Monitor Supabase logs for errors
- [ ] Set up Vercel Analytics
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic with Vercel)

### Ongoing Security

- [ ] Regularly update dependencies: `npm audit fix`
- [ ] Monitor Supabase usage and logs
- [ ] Review ban list periodically
- [ ] Back up database regularly
- [ ] Keep admin wallet keys secure

---

## 📊 Performance Optimization

### Database Indexing

Already configured in Prisma schema:
- `@@index([boardId, bumpAt])` on Thread
- `@@index([threadId, createdAt])` on Post
- `@@unique([boardId, slug])` on Board

### Image Optimization

- Next.js Image component used for automatic optimization
- Images served from Supabase CDN
- Thumbnails generated on upload

### Caching Strategy

Implemented in API routes:
```typescript
{
  cache: 'no-store', // For dynamic forum content
  revalidate: 60,    // For static pages
}
```

---

## 🆘 Troubleshooting

### Database Connection Errors

```bash
# Test connection
npx prisma db pull

# Reset connection
npx prisma db push --force-reset
```

### Vercel Build Failures

```bash
# Test build locally
npm run build

# Clear cache
vercel --prod --force
```

### RLS Policy Issues

```sql
-- Check active policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable RLS for testing
ALTER TABLE "Thread" DISABLE ROW LEVEL SECURITY;
```

---

## 📝 Notes

- Supabase free tier includes: 500MB database, 1GB storage, 2GB bandwidth
- Vercel free tier includes: 100GB bandwidth, unlimited deployments
- Both services offer generous free tiers perfect for this project
- Consider upgrading if you expect high traffic

---

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

