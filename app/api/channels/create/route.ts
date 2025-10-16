import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { Connection, PublicKey } from '@solana/web3.js';

// Helper function to generate cuid-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(12).toString('base64url').substring(0, 16);
  return `${timestamp}${randomPart}`;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const BASEMENT_TOKEN_ADDRESS = 'D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump';
const REQUIRED_BURN_AMOUNT = 5;

/**
 * POST - Create a new channel
 * For Solana users: Requires burning 5 BASEMENT tokens
 * For Base users: Free channel creation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📢 POST /api/channels/create - Request received');
    
    const body = await request.json();
    const { 
      channelName, 
      channelSlug, 
      description,
      creatorAddress,
      chain = 'base', // 'base' or 'solana'
      burnTxSignature // Required for Solana
    } = body;

    // Validation
    if (!channelName || !channelSlug || !creatorAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: channelName, channelSlug, creatorAddress' },
        { status: 400 }
      );
    }

    // Validate channel slug format
    if (!/^[a-z0-9-]+$/.test(channelSlug)) {
      return NextResponse.json(
        { error: 'Channel slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if channel already exists
    const { data: existingChannel } = await supabase
      .from('Channel')
      .select('id, slug')
      .eq('slug', channelSlug)
      .single();

    if (existingChannel) {
      return NextResponse.json(
        { error: 'Channel with this slug already exists' },
        { status: 409 }
      );
    }

    // If Solana chain, verify token burn
    if (chain === 'solana') {
      if (!burnTxSignature) {
        return NextResponse.json(
          { 
            error: 'Token burn transaction signature required for Solana channel creation',
            details: `You must burn ${REQUIRED_BURN_AMOUNT} BASEMENT tokens to create a channel on Solana`
          },
          { status: 400 }
        );
      }

      console.log('🔍 Verifying Solana token burn...');
      console.log('Transaction:', burnTxSignature);
      console.log('Creator:', creatorAddress);

      try {
        // Verify the burn transaction
        const connection = new Connection(SOLANA_RPC_URL);
        const verified = await verifyBurnTransaction(
          connection,
          burnTxSignature,
          creatorAddress,
          REQUIRED_BURN_AMOUNT
        );

        if (!verified) {
          return NextResponse.json(
            { 
              error: 'Invalid burn transaction',
              details: 'Could not verify that 5 BASEMENT tokens were burned'
            },
            { status: 400 }
          );
        }

        console.log('✅ Token burn verified!');

      } catch (error) {
        console.error('❌ Error verifying burn:', error);
        return NextResponse.json(
          { 
            error: 'Failed to verify token burn',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Create the channel
    const channelId = generateId();
    const { data: newChannel, error: createError } = await supabase
      .from('Channel')
      .insert({
        id: channelId,
        name: channelName,
        slug: channelSlug,
        description: description || '',
        createdBy: creatorAddress,
        chain: chain,
        burnTxSignature: chain === 'solana' ? burnTxSignature : null
      })
      .select()
      .single();

    if (createError || !newChannel) {
      console.error('❌ Error creating channel:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create channel',
          details: createError?.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    console.log('✅ Channel created:', newChannel.id);

    return NextResponse.json({
      success: true,
      channel: {
        id: newChannel.id,
        name: newChannel.name,
        slug: newChannel.slug,
        description: newChannel.description,
        chain: newChannel.chain,
        createdBy: newChannel.createdBy,
        createdAt: newChannel.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error in POST /api/channels/create:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Verify Solana burn transaction
 */
async function verifyBurnTransaction(
  connection: Connection,
  signature: string,
  userAddress: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    // Get transaction
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.error('❌ Transaction not found');
      return false;
    }

    if (tx.meta?.err) {
      console.error('❌ Transaction failed:', tx.meta.err);
      return false;
    }

    // Verify transaction is recent (within last hour)
    const txTime = tx.blockTime;
    const now = Math.floor(Date.now() / 1000);
    if (!txTime || now - txTime > 3600) {
      console.error('❌ Transaction too old');
      return false;
    }

    // Check token burn in transaction
    const tokenMintPubkey = new PublicKey(BASEMENT_TOKEN_ADDRESS);
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    for (let i = 0; i < preBalances.length; i++) {
      const preBalance = preBalances[i];
      const postBalance = postBalances.find(
        (pb) => pb.accountIndex === preBalance.accountIndex
      );

      if (postBalance && preBalance.mint === tokenMintPubkey.toString()) {
        const burned =
          Number(preBalance.uiTokenAmount.amount) -
          Number(postBalance.uiTokenAmount.amount);
        const burnedTokens = burned / Math.pow(10, 9); // Assuming 9 decimals

        console.log('🔥 Burned tokens:', burnedTokens);

        if (burnedTokens >= expectedAmount) {
          console.log('✅ Burn amount verified!');
          return true;
        }
      }
    }

    console.error('❌ Insufficient burn amount');
    return false;

  } catch (error) {
    console.error('❌ Error verifying transaction:', error);
    return false;
  }
}

