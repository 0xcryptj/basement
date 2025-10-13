import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import { TOKEN_CONFIG } from '@/lib/token-config';

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

/**
 * GET /api/token/info
 * Fetch real token information from on-chain data and DexScreener
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch on-chain data
    const [totalSupply, name, symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'totalSupply',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'name',
      }) as Promise<string>,
      publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'symbol',
      }) as Promise<string>,
      publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'decimals',
      }) as Promise<number>,
    ]);

    // Fetch market data from DexScreener
    let marketData = null;
    try {
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONFIG.address}`
      );
      
      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        if (dexData.pairs && dexData.pairs.length > 0) {
          // Get the most liquid pair
          const mainPair = dexData.pairs[0];
          marketData = {
            priceUsd: mainPair.priceUsd,
            priceChange24h: mainPair.priceChange?.h24 || 0,
            volume24h: mainPair.volume?.h24 || 0,
            liquidity: mainPair.liquidity?.usd || 0,
            fdv: mainPair.fdv || 0,
            marketCap: mainPair.marketCap || mainPair.fdv,
            pairAddress: mainPair.pairAddress,
            dexId: mainPair.dexId,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching DexScreener data:', error);
    }

    // Calculate additional metrics
    const totalSupplyFormatted = (Number(totalSupply) / 10 ** decimals).toFixed(2);
    const circulatingSupply = marketData && marketData.priceUsd
      ? (marketData.marketCap / parseFloat(marketData.priceUsd))
      : Number(totalSupply);

    return NextResponse.json({
      // On-chain data
      contract: {
        address: TOKEN_CONFIG.address,
        name: name,
        symbol: symbol,
        decimals: decimals,
        totalSupply: totalSupply.toString(),
        totalSupplyFormatted: totalSupplyFormatted,
        network: 'Base',
        chainId: 8453,
        platform: 'Zora Creator Coin',
      },
      
      // Market data
      market: marketData ? {
        price: marketData.priceUsd,
        priceChange24h: marketData.priceChange24h,
        volume24h: marketData.volume24h,
        liquidity: marketData.liquidity,
        fdv: marketData.fdv,
        marketCap: marketData.marketCap,
        circulatingSupply: circulatingSupply.toFixed(2),
        pairAddress: marketData.pairAddress,
        dex: marketData.dexId,
      } : null,
      
      // Links
      links: TOKEN_CONFIG.links,
      
      // Burn mechanism
      burns: {
        channelCreation: (Number(TOKEN_CONFIG.burns.createChannel) / 1e18).toFixed(2),
        burnAddress: '0x000000000000000000000000000000000000dEaD',
      },
      
      // Update timestamp
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching token info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch token information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

