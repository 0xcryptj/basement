# 🔌 Reown AppKit (WalletConnect) Integration Guide

This guide explains how Reown AppKit has been integrated into The Basement project for seamless multi-wallet support.

## 📦 What is Reown AppKit?

Reown AppKit (formerly WalletConnect) is the industry-standard protocol for connecting wallets to dApps. It provides:

- ✅ **Multi-Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect, Rainbow, and 300+ wallets
- ✅ **Network Switching**: Easy switching between Base, Ethereum, and other networks
- ✅ **QR Code Connection**: Mobile wallet connection via QR codes
- ✅ **Beautiful UI**: Pre-built, customizable wallet connection modal
- ✅ **SSR Support**: Full Next.js server-side rendering compatibility

## 🚀 What's Been Implemented

### 1. **Configuration** (`config/index.tsx`)

Created a centralized Wagmi configuration using WagmiAdapter:

```typescript
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, mainnet } from '@reown/appkit/networks'

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [base, mainnet]
})
```

**Key Features:**
- Cookie-based storage for SSR compatibility
- Base network as primary, Ethereum mainnet as fallback
- Project ID from environment variables

### 2. **Providers** (`app/providers.tsx`)

Updated to use AppKit with OnchainKit integration:

```typescript
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, mainnet],
  defaultNetwork: base,
  metadata: {
    name: 'The Basement Arcade',
    description: 'Retro Web3 Arcade on Base Network',
    url: 'https://thebasement.app',
    icons: ['/assets/icon.ico']
  },
  features: {
    analytics: true
  }
})
```

**Benefits:**
- Unified wallet experience across the app
- Works seamlessly with OnchainKit for payments
- Analytics enabled for usage tracking

### 3. **Layout Updates** (`app/layout.tsx`)

Added cookie handling for SSR hydration:

```typescript
const headersObj = await headers();
const cookies = headersObj.get('cookie');

<Providers cookies={cookies}>
  {children}
</Providers>
```

**Why This Matters:**
- Prevents hydration mismatches in Next.js
- Maintains wallet connection across page refreshes
- Optimizes server-side rendering

### 4. **Webpack Configuration** (`next.config.js`)

Added required externals for AppKit:

```javascript
webpack: (config) => {
  config.externals.push('pino-pretty', 'lokijs', 'encoding');
  return config;
}
```

**Purpose:**
- Prevents build errors with peer dependencies
- Optimizes bundle size
- Required for AppKit to work properly in Next.js

## 🎨 Using AppKit Components

### Basic Connect Button

The simplest way to add wallet connection:

```tsx
import { WalletConnectButton } from '@/components/WalletConnectButton'

export default function MyPage() {
  return <WalletConnectButton />
}
```

### Web Components (No Import Required!)

AppKit provides global web components you can use anywhere:

```tsx
// Connect button with default styling
<appkit-button />

// Account button (shows when connected)
<appkit-account-button />

// Network switcher
<appkit-network-button />
```

**Customization:**

```tsx
// Custom label
<appkit-button label="Connect Wallet" />

// Hide balance
<appkit-button balance="hide" />

// Custom size
<appkit-button size="sm" />
```

### Using with Wagmi Hooks

Get wallet information in your components:

```tsx
'use client';

import { useAccount, useBalance } from 'wagmi';

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  if (!isConnected) return <appkit-button />;

  return (
    <div>
      <p>Address: {address}</p>
      <p>Balance: {balance?.formatted} {balance?.symbol}</p>
      <appkit-account-button />
    </div>
  );
}
```

### Smart Contract Interactions

Read from contracts:

```tsx
import { useReadContract } from 'wagmi';

const { data } = useReadContract({
  address: '0x...',
  abi: contractAbi,
  functionName: 'balanceOf',
  args: [userAddress]
});
```

Write to contracts:

```tsx
import { useWriteContract } from 'wagmi';

const { writeContract } = useWriteContract();

function handleMint() {
  writeContract({
    address: '0x...',
    abi: contractAbi,
    functionName: 'mint',
    args: [amount]
  });
}
```

## 🔧 Environment Variables

Add to `.env.local`:

```bash
# Reown AppKit (WalletConnect) Project ID
# Get from: https://dashboard.reown.com
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here

# Coinbase OnchainKit API Key (if using shop/payments)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
```

### Getting Your Project ID

1. Visit [Reown Dashboard](https://dashboard.reown.com)
2. Sign up or log in
3. Click "Create New Project"
4. Enter project details:
   - **Name**: The Basement Arcade
   - **Homepage URL**: Your domain
5. Copy the Project ID
6. Add to `.env.local`

## 📱 Supported Wallets

AppKit automatically supports 300+ wallets including:

### Desktop Wallets
- ✅ MetaMask
- ✅ Coinbase Wallet
- ✅ Rainbow Wallet
- ✅ Trust Wallet
- ✅ Ledger Live
- ✅ Frame
- ✅ Rabby

### Mobile Wallets (via WalletConnect)
- ✅ MetaMask Mobile
- ✅ Coinbase Wallet Mobile
- ✅ Rainbow Mobile
- ✅ Trust Wallet Mobile
- ✅ Argent
- ✅ Zerion

### Hardware Wallets
- ✅ Ledger (via Ledger Live)
- ✅ Trezor (via MetaMask)

## 🌐 Network Configuration

Currently configured networks:

### Base (Default)
- **Chain ID**: 8453
- **Name**: Base
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Currency**: ETH

### Ethereum Mainnet (Fallback)
- **Chain ID**: 1
- **Name**: Ethereum
- **RPC**: https://eth.llamarpc.com
- **Explorer**: https://etherscan.io
- **Currency**: ETH

### Adding More Networks

Edit `config/index.tsx`:

```typescript
import { base, mainnet, optimism, arbitrum } from '@reown/appkit/networks'

export const networks = [base, mainnet, optimism, arbitrum]
```

### Custom Network

```typescript
import { defineChain } from '@reown/appkit/networks'

const customNetwork = defineChain({
  id: 1234,
  name: 'Custom Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Custom Token',
    symbol: 'CTK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.custom.network'] }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.custom.network' }
  }
})

export const networks = [base, customNetwork]
```

## 🎯 Integration with OnchainKit

AppKit works seamlessly with OnchainKit for payment features:

```tsx
import { Checkout, CheckoutButton } from '@coinbase/onchainkit/checkout';
import { useAccount } from 'wagmi';

export function ProductCheckout() {
  const { isConnected } = useAccount();

  return (
    <div>
      {!isConnected ? (
        <appkit-button />
      ) : (
        <Checkout productId="product-id">
          <CheckoutButton coinbaseBranded={true} />
        </Checkout>
      )}
    </div>
  );
}
```

## 🔍 Testing the Integration

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Wallet Connection

1. Navigate to any page with wallet connect button
2. Click the connect button
3. Choose your wallet (MetaMask, Coinbase, etc.)
4. Approve the connection
5. Verify connection state persists on page refresh

### 3. Test Network Switching

1. After connecting, click the network button
2. Switch between Base and Ethereum
3. Verify your wallet switches networks
4. Confirm app updates to show correct network

### 4. Test Shop Integration

1. Go to `/shop`
2. Connect wallet
3. Try purchasing a product
4. Verify checkout flow works correctly

## 🐛 Troubleshooting

### "Project ID is not defined" Error

**Solution:**
```bash
# Add to .env.local
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
```

Restart dev server after adding environment variables.

### Wallet Not Connecting

**Checklist:**
- ✅ Wallet extension is installed and unlocked
- ✅ You're on a supported network (Base or Ethereum)
- ✅ Project ID is valid
- ✅ Clear browser cache and cookies
- ✅ Try a different wallet

### Hydration Errors

**Solution:**
Already handled by cookie-based storage and SSR configuration.

If you see hydration warnings:
1. Make sure `cookies` prop is passed to Providers
2. Verify `ssr: true` in wagmiAdapter config
3. Clear `.next` folder and rebuild

### Build Errors

**Common causes:**
- Missing webpack externals in next.config.js
- Outdated packages

**Solution:**
```bash
# Update packages
npm update @reown/appkit @reown/appkit-adapter-wagmi

# Clear cache
rm -rf .next node_modules
npm install
```

## 📊 Analytics

AppKit includes built-in analytics when enabled:

```typescript
features: {
  analytics: true
}
```

**What's Tracked:**
- Wallet connection attempts
- Successful connections
- Network switches
- Modal opens/closes

**View Analytics:**
1. Go to [Reown Dashboard](https://dashboard.reown.com)
2. Select your project
3. View analytics tab

## 🚀 Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard
2. Deploy as normal
3. Verify wallet connections work in production

### Other Platforms

Make sure to:
- Set `NEXT_PUBLIC_WC_PROJECT_ID` environment variable
- Set `NODE_ENV=production`
- Build with `npm run build`
- Verify SSR works correctly

## 📚 Additional Resources

- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Wagmi Documentation](https://wagmi.sh)
- [Base Network Docs](https://docs.base.org)
- [OnchainKit Documentation](https://onchainkit.xyz)

## 🎉 Summary

Your project now has:

✅ **Multi-wallet support** via Reown AppKit  
✅ **Base network** as primary chain  
✅ **OnchainKit integration** for payments  
✅ **SSR compatibility** with cookies  
✅ **Pre-built UI components** ready to use  
✅ **Analytics tracking** enabled  

**Next Steps:**
1. Get your Project ID from Reown Dashboard
2. Add it to `.env.local`
3. Start using `<appkit-button />` in your pages!

---

**Built with ❤️ for The Basement Arcade**

Need help? Check the [Reown Discord](https://discord.gg/reown) or [GitHub Issues](https://github.com/reown-com/appkit)

