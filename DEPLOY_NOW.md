# 🚀 DEPLOY NOW - Quick Start Guide

## ✅ What's Been Completed

### Code Status
- ✅ **All linter errors fixed**
- ✅ **Token-gating implemented** (IRC, Forum, Chat)
- ✅ **Mobile UI fixes complete** (Arcade games responsive)
- ✅ **Smart contracts created** (BasementArcade.sol)
- ✅ **Tokenomics page updated** (Charts embedded)
- ✅ **Git committed and pushed** to dev branch

### Repository Status
```
✅ Branch: dev
✅ Commit: eb846275
✅ Files: 33 changed, 6577+ additions
✅ Pushed to: https://github.com/0xcryptj/basement.git
```

---

## 🎯 Deploy to Vercel NOW

### Option 1: Vercel Dashboard (Fastest - 2 minutes)

1. **Go to Vercel:**
   - Visit: https://vercel.com/new
   - Click "Import Git Repository"

2. **Import Your Repo:**
   - Select: `0xcryptj/basement`
   - Branch: `dev` (or `main` if you want to merge first)

3. **Configure Project:**
   ```
   Framework Preset: Next.js
   Root Directory: basement
   Build Command: npm run build
   Output Directory: (leave default)
   Install Command: npm install
   Node.js Version: 18.x or 20.x
   ```

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY = your_service_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Option 2: Vercel CLI (For Advanced Users)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from basement directory
cd basement
vercel

# Answer prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (or Yes if exists)
# - Project name? basement
# - Directory? ./ (current)
# - Modify settings? No

# Deploy to production
vercel --prod
```

---

## 🔐 Environment Variables Required

### Supabase (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional (Auto-detected)
```env
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASEMENT_TOKEN=0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23
```

---

## 🧪 Post-Deployment Testing

### 1. Test Homepage
```
✅ Visit: https://your-domain.vercel.app
✅ Check: Page loads correctly
✅ Check: Wallet connects
```

### 2. Test Arcade (Mobile Responsive)
```
✅ Visit: /arcade/arcade.html
✅ Test on mobile device or DevTools
✅ Check: All games scale properly
✅ Check: Connect 4 grid is playable
```

### 3. Test Token-Gating
```
✅ Visit: Forum or IRC
✅ Connect wallet WITHOUT tokens
✅ Try to post → Should show error with balance
✅ Connect wallet WITH tokens
✅ Try to post → Should work
```

### 4. Test Tokenomics Page
```
✅ Visit: /tokenomics.html
✅ Check: DexScreener chart loads
✅ Check: BubbleMaps chart loads
✅ Check: Price data updates
✅ Check: Links work
```

---

## 🔍 Vercel Dashboard Checklist

After deployment, verify:

### Deployment Tab
- ✅ Build successful
- ✅ No errors in logs
- ✅ Functions deployed correctly

### Settings Tab
- ✅ Environment variables added
- ✅ Framework: Next.js
- ✅ Node version: 18.x+
- ✅ Root directory: basement

### Domains Tab
- ✅ Production domain active
- ✅ HTTPS enabled
- ✅ Custom domain (if applicable)

---

## 📊 Monitor Deployment

### Real-Time Logs
```
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click latest deployment
5. View "Runtime Logs"
```

### Function Logs
```
1. Click "Functions" tab
2. View individual function logs
3. Check for errors
```

---

## 🚨 Common Issues & Fixes

### Build Fails
**Solution:**
```bash
# Locally test build
cd basement
npm run build

# If fails, fix errors then:
git add .
git commit -m "fix: build errors"
git push origin dev
# Vercel will auto-redeploy
```

### Environment Variables Missing
**Solution:**
1. Go to Project Settings
2. Click "Environment Variables"
3. Add missing variables
4. Redeploy from dashboard

### 404 Errors
**Solution:**
1. Check root directory is set to `basement`
2. Verify `next.config.js` exists
3. Check file paths are correct

### Token-Gating Not Working
**Solution:**
1. Verify Base RPC is reachable
2. Check contract address in `lib/token-config.ts`
3. Test API endpoint: `/api/token/balance?address=0x...`

---

## 🎉 Success Indicators

You know it's working when:

✅ **Homepage loads** with no errors
✅ **Arcade games** are playable on mobile
✅ **Token-gating rejects** users without tokens
✅ **Charts display** on tokenomics page
✅ **No console errors** in browser DevTools
✅ **Functions execute** successfully in logs
✅ **Token balance API** returns correct data

---

## 📱 Share Your Deployment

Once deployed, share:
```
🌐 Main Site: https://your-domain.vercel.app
🎮 Arcade: https://your-domain.vercel.app/arcade/arcade.html
💎 Tokenomics: https://your-domain.vercel.app/tokenomics.html
💬 Forum: https://your-domain.vercel.app/forum
```

---

## 🔗 Important Links

### Your Resources
- **GitHub Repo:** https://github.com/0xcryptj/basement
- **Dev Branch:** https://github.com/0xcryptj/basement/tree/dev
- **Latest Commit:** eb846275

### External Services
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://app.supabase.com
- **BaseScan:** https://basescan.org/token/0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23

### Token Info
- **Contract:** `0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23`
- **Network:** Base Mainnet
- **DexScreener:** https://dexscreener.com/base/0xc5052d8910046279fd6633b288234c2366b019f9d372d75a08d8fe01c601a6b9

---

## 🎯 Next Steps After Deployment

1. **Test Everything:** Go through all features
2. **Monitor Logs:** Watch for errors
3. **Share Links:** Post on social media
4. **Get Feedback:** Test with real users
5. **Iterate:** Fix issues quickly

---

## 💡 Pro Tips

1. **Enable Automatic Deployments:**
   - Every push to `dev` auto-deploys
   - Great for iterating quickly

2. **Set Up Preview Deployments:**
   - Every PR gets its own URL
   - Test before merging

3. **Use Vercel Analytics:**
   - Track user behavior
   - Monitor performance
   - View real-time stats

4. **Set Up Alerts:**
   - Get notified of errors
   - Monitor uptime
   - Track performance

---

## ✅ Deployment Complete Checklist

Before announcing:
- [ ] Site loads successfully
- [ ] All pages accessible
- [ ] Mobile UI working
- [ ] Token-gating active
- [ ] Charts displaying
- [ ] No console errors
- [ ] Functions executing
- [ ] Wallet connects
- [ ] Environment variables set
- [ ] Monitoring active

---

**Status:** Ready to Deploy! 🚀  
**Time to Deploy:** ~2-5 minutes  
**Difficulty:** Easy (with Vercel dashboard)

**DEPLOY NOW:** https://vercel.com/new

