/**
 * Solana Token Burn Utility for Channel Creation
 * Token: D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump
 * Required: 5 tokens to create a channel
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  ParsedAccountData,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createBurnInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';

// Your token contract address
export const BASEMENT_TOKEN_ADDRESS = 'D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump';
export const CHANNEL_CREATION_BURN_AMOUNT = 5; // 5 tokens required

export interface BurnResult {
  success: boolean;
  signature?: string;
  error?: string;
  burnedAmount?: number;
}

/**
 * Burn tokens to create a channel
 */
export async function burnTokensForChannel(
  connection: Connection,
  userPublicKey: PublicKey,
  amount: number = CHANNEL_CREATION_BURN_AMOUNT
): Promise<BurnResult> {
  try {
    const tokenMintPubkey = new PublicKey(BASEMENT_TOKEN_ADDRESS);

    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      userPublicKey
    );

    console.log('🔥 Burning tokens...');
    console.log('User:', userPublicKey.toString());
    console.log('Token account:', userTokenAccount.toString());
    console.log('Amount:', amount);

    // Check if user has enough tokens
    try {
      const accountInfo = await getAccount(connection, userTokenAccount);
      const balance = Number(accountInfo.amount);
      const requiredAmount = amount * Math.pow(10, 9); // Assuming 9 decimals

      console.log('Token balance:', balance);
      console.log('Required:', requiredAmount);

      if (balance < requiredAmount) {
        return {
          success: false,
          error: `Insufficient token balance. You have ${balance / Math.pow(10, 9)} tokens, but need ${amount} tokens to create a channel.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Token account not found. Make sure you have the BASEMENT tokens.',
      };
    }

    // Create burn instruction
    const burnInstruction = createBurnInstruction(
      userTokenAccount,
      tokenMintPubkey,
      userPublicKey,
      amount * Math.pow(10, 9), // Convert to smallest unit
      [],
      TOKEN_PROGRAM_ID
    );

    return {
      success: true,
      error: 'Burn instruction created. Please sign the transaction in your wallet.',
    };

  } catch (error) {
    console.error('❌ Token burn error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to burn tokens',
    };
  }
}

/**
 * Verify a burn transaction was successful
 */
export async function verifyBurnTransaction(
  connection: Connection,
  signature: string,
  expectedAmount: number = CHANNEL_CREATION_BURN_AMOUNT
): Promise<boolean> {
  try {
    console.log('🔍 Verifying burn transaction:', signature);

    // Get transaction details
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

    // Check if transaction contains burn instruction
    const tokenMintPubkey = new PublicKey(BASEMENT_TOKEN_ADDRESS);
    
    // Parse transaction to verify burn
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    // Find the burn in token balance changes
    for (let i = 0; i < preBalances.length; i++) {
      const preBalance = preBalances[i];
      const postBalance = postBalances.find(
        (pb) => pb.accountIndex === preBalance.accountIndex
      );

      if (postBalance && preBalance.mint === tokenMintPubkey.toString()) {
        const burned =
          Number(preBalance.uiTokenAmount.amount) -
          Number(postBalance.uiTokenAmount.amount);
        const burnedTokens = burned / Math.pow(10, 9);

        console.log('🔥 Burned tokens:', burnedTokens);

        if (burnedTokens >= expectedAmount) {
          console.log('✅ Burn verified!');
          return true;
        }
      }
    }

    console.error('❌ Burn amount not verified');
    return false;

  } catch (error) {
    console.error('❌ Error verifying burn:', error);
    return false;
  }
}

/**
 * Get user's token balance
 */
export async function getUserTokenBalance(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<number> {
  try {
    const tokenMintPubkey = new PublicKey(BASEMENT_TOKEN_ADDRESS);
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      userPublicKey
    );

    const accountInfo = await getAccount(connection, userTokenAccount);
    const balance = Number(accountInfo.amount) / Math.pow(10, 9);

    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

/**
 * Check if user has enough tokens
 */
export async function canCreateChannel(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<{ canCreate: boolean; balance: number; required: number }> {
  const balance = await getUserTokenBalance(connection, userPublicKey);
  
  return {
    canCreate: balance >= CHANNEL_CREATION_BURN_AMOUNT,
    balance,
    required: CHANNEL_CREATION_BURN_AMOUNT,
  };
}

