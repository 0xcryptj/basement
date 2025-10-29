// Currency conversion utilities
let ethPrice = 3200; // Default ETH price in USD

/**
 * Fetch current ETH price from CoinGecko API
 */
export async function fetchEthPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    ethPrice = data.ethereum.usd;
    return ethPrice;
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    return ethPrice; // Return cached value
  }
}

/**
 * Convert ETH to USD
 */
export function ethToUsd(eth: number): number {
  return eth * ethPrice;
}

/**
 * Convert USD to ETH
 */
export function usdToEth(usd: number): number {
  return usd / ethPrice;
}

/**
 * Format ETH value with USD equivalent
 */
export function formatEthWithUsd(eth: number): string {
  const usd = ethToUsd(eth);
  return `${eth.toFixed(6)} ETH (~$${usd.toFixed(2)})`;
}

/**
 * Format USD value
 */
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

// Fetch price on module load
fetchEthPrice();
// Refresh price every 5 minutes
setInterval(fetchEthPrice, 5 * 60 * 1000);

