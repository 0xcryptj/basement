import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_CONFIG } from '@/lib/token-config';

/**
 * POST /api/token/burn
 * Request a token burn transaction from the user's wallet
 * Returns transaction data that frontend should execute
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, action } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Determine burn amount based on action
    const burnAmount = action === 'createChannel' 
      ? TOKEN_CONFIG.burns.createChannel 
      : '0';

    if (burnAmount === '0') {
      return NextResponse.json(
        { error: 'Invalid burn action' },
        { status: 400 }
      );
    }

    // Dead address for burns (standard Ethereum burn address)
    const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

    // Return transaction data for frontend to execute
    return NextResponse.json({
      success: true,
      transaction: {
        to: TOKEN_CONFIG.address,
        from: walletAddress,
        data: encodeBurnTransaction(BURN_ADDRESS, burnAmount),
        value: '0x0', // No ETH value, just token transfer
      },
      burnAmount: burnAmount,
      burnAmountFormatted: (Number(burnAmount) / 1e18).toFixed(2),
      action: action,
      burnAddress: BURN_ADDRESS,
    });
  } catch (error: unknown) {
    console.error('Error preparing burn transaction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to prepare burn transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Encode ERC-20 transfer function call
 * transfer(address to, uint256 amount)
 */
function encodeBurnTransaction(to: string, amount: string): string {
  // ERC-20 transfer function signature: 0xa9059cbb
  const functionSignature = '0xa9059cbb';
  
  // Encode recipient address (remove 0x and pad to 32 bytes)
  const addressParam = to.slice(2).padStart(64, '0');
  
  // Encode amount (convert to hex and pad to 32 bytes)
  const amountHex = BigInt(amount).toString(16).padStart(64, '0');
  
  return functionSignature + addressParam + amountHex;
}

/**
 * GET /api/token/burn/stats
 * Get burn statistics
 */
export async function GET() {
  try {
    // TODO: Track burns in database for statistics
    // For now, return basic info
    
    return NextResponse.json({
      burnPerChannel: (Number(TOKEN_CONFIG.burns.createChannel) / 1e18).toFixed(2),
      burnAddress: '0x000000000000000000000000000000000000dEaD',
      totalBurned: '0', // TODO: Track in database
    });
  } catch (error: unknown) {
    console.error('Error fetching burn stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch burn stats' },
      { status: 500 }
    );
  }
}

