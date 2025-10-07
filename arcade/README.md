# 🎮 The Basement Arcade - 3D Edition

## Professional 3D Web3 Gaming Platform

A cutting-edge 3D gaming arcade built with TypeScript, Three.js, and Ethereum smart contracts on the Base Network.

---

## 🚀 Tech Stack

### Frontend
- **TypeScript 5.3+**: Type-safe development
- **Three.js 0.160+**: Advanced 3D graphics and animations
- **GSAP**: Professional animation library
- **Ethers.js 6.10**: Ethereum blockchain integration
- **Vite**: Lightning-fast build tool

### Blockchain
- **Solidity 0.8.24**: Smart contract development
- **Hardhat**: Ethereum development environment
- **Base Network**: L2 scaling solution

### 3D Features
- ✨ **Real-time 3D rendering** with WebGL
- 🌟 **Post-processing effects**: Bloom, SMAA anti-aliasing
- 💡 **Dynamic lighting**: Directional, point, and spot lights with shadows
- 🎭 **Smooth animations**: Camera transitions and object animations
- 🎨 **Retro cyberpunk aesthetic**: Neon glows and Base blue theme
- 📱 **Responsive**: Adapts to all screen sizes

---

## 📦 Installation

```bash
# Navigate to arcade directory
cd arcade

# Install dependencies
npm install

# Install Three.js types
npm install --save-dev @types/three
```

---

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```

This starts Vite dev server with hot module replacement at `http://localhost:5173`

### Type Checking
```bash
npm run type-check
```

### Build for Production
```bash
npm run build
```

Output will be in `/dist` directory.

### Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
arcade/
├── src/
│   ├── engine/
│   │   └── GameEngine.ts          # Core 3D engine
│   ├── games/
│   │   ├── CoinToss3D.ts          # 3D Coin Toss game
│   │   ├── Connect43D.ts          # 3D Connect 4 game
│   │   ├── War3D.ts               # 3D War card game (TODO)
│   │   └── RPS3D.ts               # 3D Rock Paper Scissors (TODO)
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts             # Utility functions
│   └── main.ts                    # Application entry point
├── arcade.html                    # Main HTML file
├── arcade.css                     # Styling
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite configuration
```

---

## 🎮 Games

### ✅ Coin Toss (Fully Implemented)
- **3D Environment**: Holographic gaming table with neon edges
- **Animated Coin**: Metallic coin with glowing heads (blue) and tails (purple) sides
- **Physics**: Realistic flip animation with bounce
- **Particles**: 500+ floating particles for ambient effects
- **Lighting**: Dynamic directional and point lights with shadows

#### Features:
- PvP binary choice gameplay
- Commit-reveal scheme for fairness
- 5% house cut
- Winner takes all pot

### 🔄 Connect 4 (3D Environment Complete)
- **3D Board**: 6x7 grid with glowing holes
- **Animated Pieces**: Drop animations with bounce physics
- **Spotlights**: Dual colored spotlights for dramatic effect
- **Win Detection**: Highlight winning sequence (TODO: smart contract)

### 🔄 War (Placeholder)
- 3D card table environment planned
- Animated card flip mechanics
- Chip stacks and dealer animations

### 🔄 Rock Paper Scissors (Placeholder)
- Battle arena environment
- 3D hand models with animations
- Particle effects on impact

---

## 🎨 Visual Features

### Lighting System
- **Ambient Light**: Soft overall illumination (0x404080)
- **Main Light**: Key light with shadow casting
- **Rim Light**: Base blue (#0052ff) backlighting
- **Fill Light**: Purple point light for depth
- **Neon Accents**: Cyan and magenta point lights

### Post-Processing
- **Bloom Effect**: Neon glow around emissive materials
- **SMAA**: Subpixel morphological anti-aliasing
- **Tone Mapping**: ACES Filmic for cinematic look

### Camera
- **Orbit Controls**: Mouse/touch rotation and zoom
- **Smooth Transitions**: Animated camera movements
- **Damping**: Natural feel with inertia

---

## 🤖 Demo Mode

The arcade includes a sophisticated bot system for testing:

- **10 Bot Personas**: CryptoWhale, DiamondHands, MoonBoy, etc.
- **Automated Actions**: Bots create, join, and play games
- **Realistic Timing**: 15-30 second intervals between actions
- **Persistent State**: Games saved to localStorage

### Demo Mode Usage
```typescript
// In src/main.ts
const DEMO_MODE = true; // Set to false for production
```

When enabled:
- Bots automatically populate the arcade
- Users can test games without wallet
- No blockchain transactions required
- Perfect for development and demos

---

## 📝 TypeScript Benefits

### Type Safety
```typescript
interface Game {
  id: number;
  p1: string;
  p1Name: string;
  stake: string;
  state: GameState;
  // ...
}
```

### Auto-completion
- Full IntelliSense in VS Code
- Catch errors at compile-time
- Refactoring made easy

### Maintainability
- Self-documenting code
- Clear interfaces and contracts
- Easier collaboration

---

## 🔗 Smart Contract Integration

### Coin Toss Contract
```typescript
const COIN_TOSS_ADDRESS = "0x...";
const coinTossContract = new ethers.Contract(
  COIN_TOSS_ADDRESS,
  COIN_TOSS_ABI,
  signer
);

// Create game
const tx = await coinTossContract.createGame(commit, { value: required });

// Join game
await coinTossContract.joinGame(gameId, commit, { value: required });

// Reveal
await coinTossContract.reveal(gameId, choice, salt);
```

---

## 🎯 Performance

### Optimization Techniques
- **Geometry Instancing**: Reuse geometries for particles
- **Texture Atlasing**: Combined textures to reduce draw calls
- **LOD (Level of Detail)**: Planned for complex models
- **Frustum Culling**: Automatic with Three.js
- **Pixel Ratio Capping**: Max 2x for performance

### Target Performance
- 60 FPS on desktop
- 30+ FPS on mobile
- < 100ms load time with code splitting

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Wallet connection/disconnection
- [ ] Demo mode bot behavior
- [ ] 3D environments render correctly
- [ ] Animations smooth (60 FPS)
- [ ] Responsive on mobile
- [ ] Smart contract integration
- [ ] Post-processing effects

---

## 🚀 Deployment

### Production Checklist
1. Update contract addresses in `src/main.ts`
2. Set `DEMO_MODE = false`
3. Build: `npm run build`
4. Deploy `/dist` folder to hosting
5. Ensure assets are accessible
6. Test on multiple devices

### Recommended Hosting
- **Vercel**: Automatic deployments from Git
- **Netlify**: Easy setup with drag-and-drop
- **IPFS**: Decentralized hosting
- **AWS S3 + CloudFront**: Enterprise solution

---

## 🐛 Troubleshooting

### TypeScript Errors
```bash
npm run type-check
```

### Three.js Not Loading
- Check browser console for errors
- Ensure WebGL is supported
- Update graphics drivers

### Performance Issues
- Disable post-processing: `postProcessing: false`
- Reduce shadow map size
- Lower particle count

---

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [GSAP Documentation](https://greensock.com/docs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Base Network community**

