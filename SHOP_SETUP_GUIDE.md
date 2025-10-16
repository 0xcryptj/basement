# 🛍️ Shop Setup Guide - Coinbase Commerce Integration

This guide will help you set up crypto payments for The Basement Shop using Coinbase Commerce and OnchainKit on Base network.

## 📋 Prerequisites

Before setting up the shop, you'll need:

1. **Coinbase Commerce Account** - [Sign up here](https://commerce.coinbase.com)
2. **Coinbase Developer Platform Account** - [Sign up here](https://portal.cdp.coinbase.com)
3. **Reown (WalletConnect) Account** - [Sign up here](https://cloud.reown.com)

## 🚀 Quick Start

### Step 1: Create Products in Coinbase Commerce

1. **Log in** to [Coinbase Commerce Dashboard](https://commerce.coinbase.com)
2. Click **"Create Product"**
3. For each product in the shop, create a corresponding product:

#### Recommended Products to Create:

**🎮 Arcade Pass**
- Name: `Arcade Pass`
- Description: `24-hour unlimited access to all arcade games`
- Price: `0.001 ETH` or equivalent

**👑 VIP Membership**
- Name: `VIP Membership`
- Description: `Lifetime VIP access with exclusive perks`
- Price: `0.01 ETH` or equivalent

**💰 Game Credits**
- Name: `1000 Game Credits`
- Description: `In-game currency for all arcade games`
- Price: `0.005 ETH` or equivalent

**🎨 NFT Avatar**
- Name: `Custom NFT Avatar`
- Description: `Unique NFT avatar for your profile`
- Price: `0.002 ETH` or equivalent

**🎁 Premium Bundle**
- Name: `Premium Bundle`
- Description: `Everything you need to dominate the arcade`
- Price: `0.015 ETH` or equivalent

**🎰 Lucky Ticket**
- Name: `Lucky Block Ticket`
- Description: `Entry ticket for the next Lucky Block jackpot`
- Price: `0.001 ETH` or equivalent

4. After creating each product:
   - Click **"View Product"**
   - Copy the **UUID** from the URL (it looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2: Get Coinbase Developer Platform API Key

1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com)
2. Create a new project or select existing project
3. Navigate to **API Keys**
4. Create a new API key for OnchainKit
5. Copy the API key (you won't be able to see it again!)

### Step 3: Get Reown Project ID

1. Go to [Reown Cloud](https://cloud.reown.com)
2. Create a new project
3. Copy your **Project ID**

### Step 4: Configure Environment Variables

Create a `.env.local` file in the basement directory:

```bash
# Coinbase Commerce Product IDs
NEXT_PUBLIC_PRODUCT_ARCADE_PASS=your_arcade_pass_uuid_here
NEXT_PUBLIC_PRODUCT_VIP_MEMBERSHIP=your_vip_membership_uuid_here
NEXT_PUBLIC_PRODUCT_GAME_CREDITS=your_game_credits_uuid_here
NEXT_PUBLIC_PRODUCT_NFT_AVATAR=your_nft_avatar_uuid_here

# Coinbase Developer Platform API Key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key_here

# Reown (WalletConnect) Project ID
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id_here

# Optional: Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

**⚠️ Important:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Keep your API keys secret
- Use different keys for development and production

### Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8000/shop`

3. Connect your wallet (make sure you're on Base network)

4. Try purchasing a product:
   - Click **"Buy Now with Crypto"**
   - Your wallet popup will appear
   - Confirm the transaction
   - Watch the checkout status update in real-time

### Step 6: Verify Payments

1. Go to [Coinbase Commerce Dashboard](https://commerce.coinbase.com)
2. Navigate to **Payments**
3. You should see your test payment listed
4. Check payment status and blockchain confirmation

## 🎨 Customizing Products

### Update Product Information

Edit `app/shop/page.tsx` and modify the `SHOP_PRODUCTS` array:

```typescript
{
  id: process.env.NEXT_PUBLIC_PRODUCT_YOUR_PRODUCT || 'demo-your-product',
  name: '🎯 Your Product Name',
  description: 'Your product description',
  price: 0.005, // Price in ETH
  currency: 'ETH',
  image: '/assets/your-image.png',
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ],
  category: 'your-category'
}
```

### Add Product Images

1. Add your product images to `public/assets/`
2. Update the `image` field in product configuration
3. Recommended image size: `512x512px`
4. Supported formats: PNG, JPG, SVG

## 📊 Setting Up Webhooks (Optional)

To automatically fulfill orders when payments are confirmed:

1. Go to [Coinbase Commerce Settings](https://commerce.coinbase.com/settings)
2. Navigate to **Webhook subscriptions**
3. Add your webhook endpoint: `https://yourdomain.com/api/webhooks/commerce`
4. Select events to subscribe to:
   - `charge:created`
   - `charge:confirmed`
   - `charge:failed`
5. Copy the webhook secret

### Create Webhook Handler

Create `app/api/webhooks/commerce/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  
  // Verify webhook signature
  // Process payment
  // Fulfill order
  
  return NextResponse.json({ received: true });
}
```

## 🔒 Security Best Practices

### Environment Variables
- ✅ Use `.env.local` for local development
- ✅ Use platform environment variables for production (Vercel, etc.)
- ❌ Never commit API keys to git
- ❌ Never expose API keys in client-side code

### Smart Wallets
The integration uses Coinbase Smart Wallets for enhanced security:
- Gas sponsorship capabilities
- Better UX with batched transactions
- Enhanced security features

## 🌐 Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Deploy!

### Update Configuration

In production, update `src/app/config.ts`:

```typescript
export const NEXT_PUBLIC_URL = 'https://your-production-domain.com';
```

## 🆘 Troubleshooting

### Wallet Not Connecting
**Solution:**
- Make sure you're on Base network (Chain ID: 8453)
- Try clearing browser cache
- Update wallet extension to latest version

### "Product Not Configured" Error
**Solution:**
- Verify product UUID is correct in `.env.local`
- Make sure environment variable name matches
- Restart dev server after changing `.env.local`

### Payment Not Processing
**Solution:**
- Check wallet has enough ETH for transaction + gas
- Verify you're on Base Mainnet, not testnet
- Check Coinbase Commerce dashboard for payment status

### OnchainKit API Errors
**Solution:**
- Verify API key is valid
- Check API key has correct permissions
- Ensure API key is for the correct environment

## 📚 Additional Resources

- [Coinbase Commerce Docs](https://docs.cloud.coinbase.com/commerce/docs)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Base Network Docs](https://docs.base.org)
- [Wagmi Documentation](https://wagmi.sh)

## 💡 Features Breakdown

### What's Included

✅ **Multi-product shop interface**
- Product grid with categories
- Feature lists and descriptions
- USD price estimates

✅ **Coinbase Commerce Integration**
- Secure crypto payments
- Real-time checkout status
- Smart wallet support

✅ **Base Network Optimization**
- Low gas fees
- Fast confirmations
- EVM compatibility

✅ **OnchainKit Components**
- Pre-built checkout UI
- Wallet connection
- Transaction status tracking

### What You Need to Add

🔧 **Order Fulfillment**
- Webhook handler for payment confirmation
- Database to track purchases
- Automated delivery system

🔧 **User Dashboard**
- View purchase history
- Manage active subscriptions
- Download purchased items

🔧 **Admin Panel**
- View all orders
- Manage products
- Generate reports

## 🎯 Next Steps

After basic setup, consider:

1. **Add Order Tracking** - Let users see their purchase history
2. **Implement Webhooks** - Auto-fulfill orders on payment
3. **Add Analytics** - Track sales and popular products
4. **Multi-chain Support** - Accept payments on other networks
5. **Subscription Products** - Recurring payments for memberships

---

**Built with ❤️ for The Basement Arcade**

Questions? Check the [Base documentation](https://docs.base.org/cookbook/accept-crypto-payments) or reach out to support!

