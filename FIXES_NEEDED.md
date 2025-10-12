# Critical Fixes Needed

## ✅ COMPLETED
1. **Channel #chs created** - Now exists in database

## 🔧 TO FIX

### 1. Mobile Navbar - Hide "The Basement" text on mobile
**File**: `public/style.css`
**Fix**: Add media query to hide `.logo-text` on mobile devices

### 2. Anonymous Chat - Enable UI
**File**: `public/index.html`
**Issue**: Chat buttons are disabled by default (lines 156-157)
**Fix**: Remove `disabled` attribute from buttons OR enable them on page load in script.js

### 3. Connect 4 Sizing
**File**: `public/arcade/connect4-game.html`
**Status**: Already has overflow:hidden and fixed positioning
**Check**: Verify on actual device - may need viewport adjustments

### 4. Forum Upvote/Downvote
**File**: `app/api/forum/vote/route.ts` (exists)
**Status**: API endpoint exists, need to verify frontend integration

### 5. Forum Posts - Save for Authenticated Users
**File**: Need to check `app/api/forum/posts/route.ts` and threads
**Action**: Verify posts are being saved to database, not mock data

### 6. Mobile UI Improvements Needed
- Hide `.logo-text` on small screens
- Improve chat panel responsiveness
- Forum mobile layout

## Quick Fix Script

Run this SQL to apply the message expiration migration:
```sql
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Message_expiresAt_idx" ON "Message"("expiresAt");
```

