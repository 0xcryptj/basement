# 🧪 Testing Guide - 3D Arcade Games

## Quick Start

### 1. Start the Dev Server

```bash
cd arcade
npm run dev
```

The server will start at `http://localhost:5173`

### 2. Open in Browser

The dev server should automatically open your browser. If not, manually navigate to:

```
http://localhost:5173/index.html
```

Or directly to the arcade page:

```
http://localhost:5173/arcade.html
```

---

## Testing the 3D Games

### Coin Toss 3D

1. Click the **"Coin Toss"** tile (first game)
2. Modal should open
3. **Wait 1-2 seconds** for 3D environment to load
4. You should see:
   - ✅ Dark blue-black background
   - ✅ Holographic table with neon blue edges
   - ✅ Metallic coin hovering above table
   - ✅ Coin slowly rotating (idle animation)
   - ✅ Floating particles in background
   - ✅ Corner pillars with neon rings

5. **Test interaction:**
   - Click and drag to rotate the view
   - Scroll to zoom in/out
   - The coin should stay visible and animated

### Connect 4 3D

1. Click the **"Connect 4"** tile (second game)
2. Modal should open
3. **Wait 1-2 seconds** for 3D environment to load
4. You should see:
   - ✅ Vertical board with 6 rows x 7 columns
   - ✅ Glowing blue holes in each position
   - ✅ Cyan neon rings around holes
   - ✅ Metallic stand/pedestal
   - ✅ Spotlights illuminating the board

5. **Test interaction:**
   - Rotate the board by dragging
   - Zoom in to see the neon rings
   - Board should cast shadows on the floor

---

## Troubleshooting

### "Cannot find module 'three'"

```bash
cd arcade
npm install
```

### Server won't start

Make sure you're in the `arcade` directory:

```bash
cd arcade
npm run dev
```

### Black screen / No 3D

1. Open browser console (F12)
2. Look for errors
3. Common issues:
   - WebGL not supported (update graphics drivers)
   - Module loading errors (check console)
   - CORS errors (use dev server, not file://)

### Performance issues

In `src/main.ts`, adjust the config:

```typescript
const config: GameEnvironmentConfig = {
  antialias: false,        // Disable for better performance
  shadows: false,          // Disable shadows
  postProcessing: false,   // Disable bloom/effects
  ambientOcclusion: false,
  bloomEffect: false
};
```

---

## Browser Compatibility

### ✅ Supported Browsers
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+ (Mac)
- Opera 76+

### ❌ Not Supported
- Internet Explorer (any version)
- Very old browsers without WebGL 2.0

---

## Demo Mode Testing

The arcade runs in **DEMO MODE** by default, so you can test without connecting a wallet:

### What to expect:

1. **Bots create games** every 15-30 seconds
2. **Bot names**: CryptoWhale, MoonBoy, DiamondHands, etc.
3. **Stakes**: Random 0.01-0.1 ETH
4. **Auto-play**: Bots join and reveal automatically

### Test the demo:

1. Open Coin Toss modal
2. Switch to "Join Game" tab
3. You should see bot-created games appearing
4. Click "Create Game" to create your own
5. A bot should join within 5-10 seconds

---

## Performance Metrics

### Target FPS:
- Desktop: 60 FPS
- Mobile: 30+ FPS

### Check FPS:
Open browser console and look for:
```
requestAnimationFrame is running at ~60fps
```

Or use Chrome DevTools > Performance tab

---

## Known Issues

### 1. First load is slow
- Three.js modules need to download (~1MB)
- Subsequent loads are fast (cached)

### 2. Module resolution warnings
- Vite may show optimization warnings
- These are normal and don't affect functionality

### 3. TypeScript errors in console
- During development, some type errors may appear
- They don't break the runtime

---

## Development Tips

### Hot Module Replacement (HMR)

When you edit `.ts` files:
1. Save the file
2. Browser auto-refreshes
3. Changes appear instantly

### Debugging 3D Issues

In `src/engine/GameEngine.ts`, add:

```typescript
// Add axes helper
const axesHelper = new THREE.AxesHelper(5);
this.scene.add(axesHelper);

// Add grid helper  
const gridHelper = new THREE.GridHelper(20, 20);
this.scene.add(gridHelper);
```

This shows axes (RGB = XYZ) and a grid for orientation.

---

## Next Steps After Testing

Once 3D is confirmed working:

1. ✅ Verify both Coin Toss and Connect 4 load
2. ✅ Test on different browsers
3. ✅ Test on mobile (if available)
4. 🔄 Deploy to testnet
5. 🔄 Connect real smart contracts
6. 🔄 Build for production: `npm run build`

---

## Getting Help

If you encounter issues:

1. **Check browser console** (F12) for errors
2. **Check terminal** where `npm run dev` is running
3. **Verify Node version**: `node --version` (should be 16+)
4. **Clear cache**: Hard refresh (Ctrl+Shift+R)

---

## Success Checklist

- [ ] Dev server starts without errors
- [ ] Browser opens to arcade
- [ ] Coin Toss 3D environment loads
- [ ] Coin is visible and rotating
- [ ] Can rotate camera with mouse
- [ ] Connect 4 3D environment loads
- [ ] Board is visible with holes
- [ ] Can zoom and rotate view
- [ ] Demo mode bots are creating games
- [ ] No console errors

---

**If all checkboxes are checked, your 3D arcade is working perfectly! 🎉**

