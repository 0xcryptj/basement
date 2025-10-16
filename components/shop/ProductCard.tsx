'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  features: string[];
  category: string;
}

interface ProductCardProps {
  product: Product;
  isConnected: boolean;
}

export function ProductCard({ product, isConnected }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Check if product ID is configured (not a demo ID)
  const isProductConfigured = !product.id.startsWith('demo-');

  return (
    <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105">
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/30">
        <div className="absolute inset-0 bg-[url('/assets/bk3.png')] bg-cover bg-center opacity-20" />
        <div className="relative flex items-center justify-center h-full">
          {/* Placeholder - replace with actual images */}
          <div className="text-8xl opacity-80 filter drop-shadow-lg">
            {product.name.split(' ')[0]}
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          {product.price} {product.currency}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20">
          {product.category.toUpperCase()}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm font-mono">
            {product.description}
          </p>
        </div>

        {/* Features Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-400 text-sm font-mono hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Features
        </button>

        {/* Features List */}
        {showDetails && (
          <ul className="space-y-2 text-sm text-gray-300 font-mono bg-black/20 p-4 rounded-lg border border-white/5">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Purchase Section */}
        <div className="pt-4 border-t border-white/10">
          {!isConnected ? (
            <div className="space-y-2">
              <ConnectWallet className="w-full" />
              <p className="text-xs text-gray-400 text-center font-mono">
                Connect wallet to purchase
              </p>
            </div>
          ) : !isProductConfigured ? (
            <div className="space-y-2">
              <button
                disabled
                className="w-full bg-gray-600/50 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed border border-gray-500/30"
              >
                🔧 Product Not Configured
              </button>
              <p className="text-xs text-yellow-400 text-center font-mono">
                Set up this product in Coinbase Commerce
              </p>
            </div>
          ) : (
            <Checkout productId={product.id}>
              <CheckoutButton 
                coinbaseBranded={true}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
                text="🛒 Buy Now with Crypto"
              />
              <div className="mt-4">
                <CheckoutStatus />
              </div>
            </Checkout>
          )}
        </div>

        {/* USD Conversion Estimate */}
        <div className="text-xs text-gray-500 text-center font-mono pt-2 border-t border-white/5">
          ~${(product.price * 2000).toFixed(2)} USD (at $2000/ETH)
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
      </div>
    </div>
  );
}

