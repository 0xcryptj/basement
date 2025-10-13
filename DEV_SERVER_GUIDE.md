# 🚀 DEV SERVER GUIDE

## ⚠️ IMPORTANT: Directory Structure

Your project structure is:
```
C:\Users\Arbis\OneDrive\Desktop\basement\          ← PARENT (Sharp Shot old project)
└── basement\                                       ← THIS IS THE BASEMENT PROJECT!
    ├── package.json                               ← The Basement
    ├── app\                                       ← Next.js app
    ├── public\                                    ← Static files
    └── ...
```

## ✅ CORRECT Way to Run Dev Server

### From Terminal:
```bash
# Make sure you're in the correct directory
cd C:\Users\Arbis\OneDrive\Desktop\basement\basement

# Then run dev server
npm run dev
```

### OR from PowerShell:
```powershell
cd basement\basement
npm run dev
```

## ❌ WRONG - Don't Do This:
```bash
# From parent directory:
cd C:\Users\Arbis\OneDrive\Desktop\basement
npm run dev  # ← This runs Sharp Shot, not Basement!
```

---

## 🌐 Dev Server URLs

Once running correctly, you'll see:

```
▲ Next.js 15.5.4
- Local:        http://localhost:8000
- Network:      http://100.116.152.114:8000
- Environments: .env.local, .env

✓ Ready in Xs
```

**NOT:**
```
🚀 SHARP SHOT LAUNCH-READY SERVER: http://0.0.0.0:5000  ← Wrong!
```

---

## 🔍 Verify You're in Correct Directory

Check with:
```bash
pwd  # Should show: .../basement/basement
ls package.json  # Should show "the-basement" as name
```

---

## 🚀 I've Already Started It For You!

The dev server should now be running at:
- **http://localhost:8000**
- **http://100.116.152.114:8000**

Test it now!

---

## 📝 Common Issues

### "Sharp Shot" appears instead
**Solution:** You're in wrong directory. `cd basement` first.

### Port 8000 already in use
**Solution:** 
```bash
# Kill existing process
npx kill-port 8000
# Then run again
npm run dev
```

### Build errors
**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

---

**The Basement dev server should now be running on port 8000!** ✅

