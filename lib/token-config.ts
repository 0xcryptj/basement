/**
 * The Basement Token Configuration
 * Base Network Creator Coin (Zora)
 */

export const TOKEN_CONFIG = {
  // Contract Address on Base Network
  address: '0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23' as const,
  
  // Network Configuration
  chain: {
    id: 8453, // Base Mainnet
    name: 'Base',
    network: 'base',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
      public: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
  },
  
  // Token Details
  token: {
    name: 'The Basement Token',
    symbol: 'BASEMENT',
    decimals: 18,
    type: 'ERC-20',
    platform: 'Zora Creator Coin',
  },
  
  // Minimum Holdings Requirements
  requirements: {
    createChannel: '1000000000000000', // 0.001 tokens (in wei)
    createThread: '1000000000000000', // 0.001 tokens
    postMessage: '1000000000000000', // 0.001 tokens
    createPost: '1000000000000000', // 0.001 tokens
  },
  
  // Pool Address (from Dex Screener)
  poolAddress: '0xc5052d8910046279fd6633b288234c2366b019f9d372d75a08d8fe01c601a6b9',
  
  // External Links
  links: {
    bubbleMaps: 'https://iframe.bubblemaps.io/map?partnerId=MEPFzGONpHyRb7DIadtA&address=0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23&chain=base&limit=80',
    geckoterminal: 'https://www.geckoterminal.com/base/pools/0xc5052d8910046279fd6633b288234c2366b019f9d372d75a08d8fe01c601a6b9',
    dexScreener: 'https://dexscreener.com/base/0xc5052d8910046279fd6633b288234c2366b019f9d372d75a08d8fe01c601a6b9',
    baseScan: `https://basescan.org/token/0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23`,
    zora: 'https://zora.co',
  },
  
  // ERC-20 ABI (minimal for balance checking)
  abi: [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      type: 'function',
    },
  ] as const,
} as const;

// Helper function to format token amount
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  return `${wholePart}.${trimmedFractional}`;
}

// Helper function to check if user meets minimum requirement
export function meetsMinimumRequirement(
  balance: bigint,
  requirement: keyof typeof TOKEN_CONFIG.requirements
): boolean {
  const minAmount = BigInt(TOKEN_CONFIG.requirements[requirement]);
  return balance >= minAmount;
}

// Export for convenience
export const CONTRACT_ADDRESS = TOKEN_CONFIG.address;
export const CHAIN_ID = TOKEN_CONFIG.chain.id;

