'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';

// Mock products - In production, these would come from Coinbase Commerce
export const SHOP_PRODUCTS = [
  {
    id: process.env.NEXT_PUBLIC_PRODUCT_ARCADE_PASS || 'demo-arcade-pass',
    name: '🎮 Arcade Pass',
    description: '24-hour unlimited access to all arcade games',
    price: 0.001,
    currency: 'ETH',
    image: '/assets/arcade-pass.png',
    features: [
      'Unlimited gameplay for 24 hours',
      'Access to all premium games',
      'No transaction fees on wins',
      'Exclusive badge and flair'
    ],
    category: 'passes'
  },
  {
    id: process.env.NEXT_PUBLIC_PRODUCT_VIP_MEMBERSHIP || 'demo-vip-membership',
    name: '👑 VIP Membership',
    description: 'Lifetime VIP access with exclusive perks',
    price: 0.01,
    currency: 'ETH',
    image: '/assets/vip-badge.png',
    features: [
      'Lifetime access to all games',
      'VIP chat badge and colors',
      '2x reward multiplier',
      'Early access to new games',
      'Private VIP lounge access'
    ],
    category: 'memberships'
  },
  {
    id: process.env.NEXT_PUBLIC_PRODUCT_GAME_CREDITS || 'demo-game-credits',
    name: '💰 1000 Game Credits',
    description: 'In-game currency for all arcade games',
    price: 0.005,
    currency: 'ETH',
    image: '/assets/credits.png',
    features: [
      '1000 game credits',
      'Use across all games',
      'Never expires',
      '10% bonus on first purchase'
    ],
    category: 'credits'
  },
  {
    id: process.env.NEXT_PUBLIC_PRODUCT_NFT_AVATAR || 'demo-nft-avatar',
    name: '🎨 Custom NFT Avatar',
    description: 'Unique NFT avatar for your profile',
    price: 0.002,
    currency: 'ETH',
    image: '/assets/nft-avatar.png',
    features: [
      'Unique generative NFT',
      'Use as profile picture',
      'Tradeable on OpenSea',
      'Unlock special emojis'
    ],
    category: 'nfts'
  },
  {
    id: 'demo-premium-bundle',
    name: '🎁 Premium Bundle',
    description: 'Everything you need to dominate the arcade',
    price: 0.015,
    currency: 'ETH',
    image: '/assets/bundle.png',
    features: [
      'VIP Membership included',
      '2000 game credits',
      'Custom NFT Avatar',
      'Exclusive founder badge',
      'Save 25% vs buying separately'
    ],
    category: 'bundles'
  },
  {
    id: 'demo-lucky-ticket',
    name: '🎰 Lucky Block Ticket',
    description: 'Entry ticket for the next Lucky Block jackpot',
    price: 0.001,
    currency: 'ETH',
    image: '/assets/lucky-ticket.png',
    features: [
      'Guaranteed entry to next round',
      'Auto-enter when round starts',
      '2x chance multiplier',
      'Special gold ticket badge'
    ],
    category: 'tickets'
  }
];

export default function ShopPage() {
  const { address, isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '🌟 All Items', count: SHOP_PRODUCTS.length },
    { id: 'passes', label: '🎮 Passes', count: SHOP_PRODUCTS.filter(p => p.category === 'passes').length },
    { id: 'memberships', label: '👑 VIP', count: SHOP_PRODUCTS.filter(p => p.category === 'memberships').length },
    { id: 'credits', label: '💰 Credits', count: SHOP_PRODUCTS.filter(p => p.category === 'credits').length },
    { id: 'nfts', label: '🎨 NFTs', count: SHOP_PRODUCTS.filter(p => p.category === 'nfts').length },
    { id: 'bundles', label: '🎁 Bundles', count: SHOP_PRODUCTS.filter(p => p.category === 'bundles').length },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? SHOP_PRODUCTS 
    : SHOP_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/assets/bk3.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
              🛍️ Basement Shop
            </h1>
            <p className="text-xl text-gray-300 mb-8 font-mono">
              Level up your arcade experience with crypto payments on Base
            </p>
            
            {!isConnected && (
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 mb-4">Connect your wallet to start shopping</p>
                  <ConnectWallet className="w-full" />
                </div>
              </div>
            )}

            {isConnected && (
              <div className="flex items-center justify-center gap-3 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-mono text-sm transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isConnected={isConnected}
            />
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold mb-4 text-blue-400">💡 How to Shop</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300 font-mono text-sm">
            <div>
              <h4 className="font-bold text-purple-400 mb-2">1️⃣ Connect Wallet</h4>
              <p>Use MetaMask or Coinbase Wallet to connect to Base network</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-400 mb-2">2️⃣ Choose Items</h4>
              <p>Browse and select products you want to purchase</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-400 mb-2">3️⃣ Checkout</h4>
              <p>Click "Buy Now" and confirm the transaction in your wallet</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-400 mb-2">4️⃣ Enjoy!</h4>
              <p>Items are instantly activated after blockchain confirmation</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 font-bold mb-2">⚡ Benefits of Crypto Payments</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ No credit card fees or chargebacks</li>
              <li>✅ Instant global transactions 24/7</li>
              <li>✅ Fast settlement with blockchain confirmation</li>
              <li>✅ Enhanced security with smart wallets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

