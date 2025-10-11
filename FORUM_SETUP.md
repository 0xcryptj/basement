# Forum Module Quick Setup Guide

This guide will get the 4chan-style anonymous forum up and running.

## Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

## Quick Start (5 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb basement_forum
```

Or use your preferred PostgreSQL client.

### 3. Configure Environment

Copy the example environment file and edit it:

```bash
cp env.forum.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/basement_forum"
FORUM_SERVER_SALT="your-secure-random-salt-here"
```

**IMPORTANT**: Generate a secure random salt for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Seed initial boards (/g/, /biz/, /a/, /b/)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit:
- Main site: `http://localhost:8000`
- Forum: `http://localhost:8000/forum`

## Adding Admins

To grant moderation privileges to a wallet address, run this SQL:

```sql
INSERT INTO "Admin" ("walletAddr", "createdAt") 
VALUES ('0xYourWalletAddressHere', NOW());
```

Or use a database client like pgAdmin, TablePlus, or DBeaver.

## Testing the Forum

1. Navigate to `http://localhost:8000/forum`
2. Connect your wallet (MetaMask, Phantom, etc.)
3. Click on any board (e.g., /g/)
4. Create a test thread with optional image
5. Reply to the thread
6. Test sage, tripcodes, and moderation features

## Production Deployment

### Environment Variables

For production, ensure you set:

```env
# Strong random salt (MUST be different from development)
FORUM_SERVER_SALT="your-production-salt"

# Production database
DATABASE_URL="postgresql://prod_user:strong_password@db_host:5432/basement_forum"

# Public URL
NEXT_PUBLIC_URL="https://yourdomain.com"

# Optional: S3 for image storage
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
FORUM_BUCKET="your-bucket-name"
```

### Build for Production

```bash
# Build the Next.js app
npm run build

# Start production server
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Connect PostgreSQL database (Vercel Postgres or external)
5. Deploy!

Vercel automatically handles:
- Next.js builds
- Environment variables
- HTTPS/SSL
- CDN for static assets

## Storage Options

### Local Filesystem (Default)

Images stored in `public/uploads/forum/`. Works for development and small deployments.

### AWS S3 (Recommended for Production)

1. Create S3 bucket
2. Set bucket permissions for public read
3. Add AWS credentials to `.env`
4. Update `lib/forum/storage.ts` if needed

### Supabase Storage (Alternative)

1. Create Supabase project
2. Enable Storage
3. Add Supabase credentials to `.env`
4. Update storage adapter in `lib/forum/storage.ts`

### Cloudflare R2 (S3-compatible, no egress fees)

Similar to S3 setup, just use R2 endpoint and credentials.

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Ensure database exists
- Check firewall/network settings

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Images not uploading
- Check folder permissions: `chmod 755 public/uploads/forum`
- Verify disk space
- Check file size limits in `lib/forum/constants.ts`

### Rate limiting too strict
Edit `lib/forum/constants.ts`:
```typescript
RATE_LIMIT_POST_SECONDS: 10,  // Increase this
RATE_LIMIT_BURST: 3,           // Or increase this
```

## Security Checklist

- [ ] Changed FORUM_SERVER_SALT from default
- [ ] Using strong PostgreSQL password
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Admin wallets added to database
- [ ] robots.txt configured (forum disallowed by default)
- [ ] Environment variables secured (not in git)
- [ ] Database backups configured
- [ ] Image upload limits set appropriately
- [ ] Content moderation plan in place

## Adding New Boards

### Via Database

```sql
INSERT INTO "Board" (slug, title, about, "isHidden", "createdAt", "updatedAt")
VALUES ('tech', 'Tech Support', 'Get help with tech issues', false, NOW(), NOW());
```

### Via Prisma

Create a migration or seed file:

```typescript
await prisma.board.create({
  data: {
    slug: 'tech',
    title: 'Tech Support',
    about: 'Get help with tech issues',
  },
});
```

## Customization

### Board Colors

Edit `lib/forum/constants.ts`:

```typescript
export const BOARD_INFO = {
  g: { title: 'Technology', about: '...', color: '#06b6d4' },
  // Add your boards here
};
```

### Rate Limits

Edit `lib/forum/constants.ts`:

```typescript
export const CONFIG = {
  RATE_LIMIT_POST_SECONDS: 10,  // Time between posts
  RATE_LIMIT_BURST: 3,           // Max posts in window
  // ...
};
```

### Image Settings

Edit `lib/forum/constants.ts`:

```typescript
export const CONFIG = {
  IMAGE_MAX_MB: 8,               // Max file size
  THUMB_SIZE: 250,               // Thumbnail dimensions
  ACCEPTED_MIME: [...],          // Allowed file types
  // ...
};
```

## Support

For issues:
1. Check this guide
2. Read the main README.md
3. Check the code comments
4. Open a GitHub issue

## Next Steps

- Set up automated database backups
- Configure S3 or alternative storage
- Add more boards
- Customize styling
- Set up monitoring/analytics
- Create content moderation guidelines
- Add admin dashboard (optional)

---

**Ready to post!** Visit `/forum` to start building your community.

