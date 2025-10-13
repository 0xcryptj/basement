# 🧪 LOCAL TESTING GUIDE

## 🌐 Your Dev Server URLs

**Local:** http://localhost:8000  
**Network:** http://100.116.152.114:8000

---

## ✅ What to Test

### 1. **Homepage & Chat** (http://localhost:8000)
```
✅ Page loads smoothly with animations
✅ Chat sidebar displays properly
✅ Chat scrolling works (no overlap with footer)
✅ Footer shows at bottom (not fixed)
✅ Social icons are clean (no borders)
✅ Shop and Forum show "Coming Soon" (grayed out)

Test Chat:
- [ ] Send message WITHOUT wallet → Should work
- [ ] Switch channels (#basement, #chs, #zora)
- [ ] Each channel shows ONLY its messages
- [ ] Scroll chat → Should scroll smoothly
- [ ] Footer doesn't overlap chat

Test Channel Creation:
- [ ] Click + button WITHOUT wallet → Should show alert
- [ ] Connect wallet → Should switch to Base
- [ ] Click + button WITH wallet → Dialog should open
- [ ] Shows "5 tokens will be burned" message
```

### 2. **Tokenomics** (http://localhost:8000/tokenomics.html)
```
✅ Real token data loads
✅ DexScreener chart displays
✅ No BubbleMaps iframe (only button)
✅ Burn counter shows "5 per channel"
✅ Mobile responsive
✅ Footer displays correctly

Test:
- [ ] Page loads without errors
- [ ] Chart embedded properly
- [ ] All stats show real data
- [ ] Footer at bottom
- [ ] Social icons work
```

### 3. **Arcade Games** (http://localhost:8000/arcade/arcade.html)
```
✅ Game grid displays properly
✅ Games are properly sized
✅ No overflow issues
✅ Buttons are clickable

Test Each Game:
- [ ] Connect 4 → Grid fits screen, cells proper size
- [ ] Coin Toss → Coin animation fits viewport
- [ ] War → Cards properly sized
- [ ] RPS → Buttons not too large
- [ ] All mobile responsive (try DevTools mobile view)
```

### 4. **Wallet Connection**
```
Test:
- [ ] Click Connect Wallet
- [ ] Select wallet type
- [ ] Should auto-switch to Base network
- [ ] Address displays in navbar
- [ ] Can disconnect properly
```

### 5. **Mobile Testing** (Use DevTools)
```
iPhone SE (375px):
- [ ] All text readable
- [ ] Buttons tappable
- [ ] Chat scrolls properly
- [ ] Arcade games fit screen
- [ ] No horizontal scroll

iPad (768px):
- [ ] Layout adjusts properly
- [ ] Games scale correctly
- [ ] Chat sidebar proper size

Desktop (1024px+):
- [ ] Full layout displays
- [ ] Animations smooth
- [ ] Everything accessible
```

---

## 🔍 What Was Fixed

### Chat Display
- ✅ Fixed scrolling with `min-height: 0`
- ✅ Proper flex layout
- ✅ Smooth scroll behavior
- ✅ Channel separation working
- ✅ Messages load per channel

### Arcade Sizing
- ✅ Reduced all game sizes
- ✅ Connect 4: 65vw, 380px max → minmax(40-50px) cells
- ✅ Mobile: scale(0.75) for better fit
- ✅ Professional responsive breakpoints

### Animations
- ✅ Fade in on page load
- ✅ Slide in from left (sidebar)
- ✅ Slide in from right (messages, modals)
- ✅ Pulse glow effects
- ✅ Button ripple on hover
- ✅ Smooth transitions (250ms)

### Footer
- ✅ Changed from fixed → relative
- ✅ No overlap with chat
- ✅ Icons clean (no borders)
- ✅ Contract address removed
- ✅ Scrollable into void

### Professional Features
- ✅ CSS Variables (design tokens)
- ✅ Spacing scale (8px base)
- ✅ Typography scale
- ✅ Z-index system
- ✅ Mobile-first responsive
- ✅ Accessibility (focus states, reduce motion)

---

## 🐛 Known Issues (If Any)

Test and look for:
- [ ] Any text too small to read
- [ ] Any buttons too small to click
- [ ] Any overflow or scrolling issues
- [ ] Any alignment problems
- [ ] Any animation performance issues

---

## 📝 Report Issues

If you find issues, note:
1. What page/section
2. Screen size/device
3. What's wrong
4. Screenshot if possible

Then I can fix them before deployment!

---

## 🚀 When Ready to Deploy

After testing locally and everything looks good:

```bash
git add -A
git commit -m "final: verified all fixes on local dev server"
git push origin dev
vercel --prod --yes
```

---

**Test thoroughly before deploying to save Vercel deployments!** 🎯

