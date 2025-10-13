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
 * GET /api/token/balance
 * Check token balance for a given address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Fetch token balance
    const balance = await publicClient.readContract({
      address: TOKEN_CONFIG.address as Address,
      abi: TOKEN_CONFIG.abi,
      functionName: 'balanceOf',
      args: [address as Address],
    }) as bigint;

    // Check against requirements
    const canCreateChannel = balance >= BigInt(TOKEN_CONFIG.requirements.createChannel);
    const canCreateThread = balance >= BigInt(TOKEN_CONFIG.requirements.createThread);
    const canPostMessage = balance >= BigInt(TOKEN_CONFIG.requirements.postMessage);
    const canCreatePost = balance >= BigInt(TOKEN_CONFIG.requirements.createPost);

    // Get total supply
    let totalSupply = BigInt(0);
    try {
      totalSupply = await publicClient.readContract({
        address: TOKEN_CONFIG.address as Address,
        abi: TOKEN_CONFIG.abi,
        functionName: 'totalSupply',
      }) as bigint;
    } catch (e) {
      console.error('Error fetching total supply:', e);
    }

    return NextResponse.json({
      address,
      balance: balance.toString(),
      balanceFormatted: (Number(balance) / 1e18).toFixed(6),
      totalSupply: totalSupply.toString(),
      totalSupplyFormatted: (Number(totalSupply) / 1e18).toFixed(2),
      permissions: {
        canCreateChannel,
        canCreateThread,
        canPostMessage,
        canCreatePost,
      },
      requirements: {
        createChannel: TOKEN_CONFIG.requirements.createChannel,
        createThread: TOKEN_CONFIG.requirements.createThread,
        postMessage: TOKEN_CONFIG.requirements.postMessage,
        createPost: TOKEN_CONFIG.requirements.createPost,
      },
      isHolder: balance > BigInt(0),
      meetsMinimumRequirements: canCreateChannel && canCreateThread && canPostMessage && canCreatePost,
    });
  } catch (error: any) {
    console.error('Error checking token balance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check token balance',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/token/balance
 * Batch check balances for multiple addresses
 */
export async function POST(request: NextRequest) {
  try {
    const { addresses } = await request.json();

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Addresses array is required' },
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 addresses per request' },
        { status: 400 }
      );
    }

    // Fetch balances in parallel
    const balances = await Promise.all(
      addresses.map(async (address: string) => {
        try {
          const balance = await publicClient.readContract({
            address: TOKEN_CONFIG.address as Address,
            abi: TOKEN_CONFIG.abi,
            functionName: 'balanceOf',
            args: [address as Address],
          }) as bigint;

          return {
            address,
            balance: balance.toString(),
            balanceFormatted: (Number(balance) / 1e18).toFixed(6),
            isHolder: balance > BigInt(0),
            meetsMinimum: balance >= BigInt(TOKEN_CONFIG.requirements.createChannel),
          };
        } catch (error) {
          return {
            address,
            error: 'Failed to fetch balance',
          };
        }
      })
    );

    return NextResponse.json({ balances });
  } catch (error: any) {
    console.error('Error checking token balances:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check token balances',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

