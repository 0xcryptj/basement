import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana RPC endpoints
export const SOLANA_NETWORKS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com'
} as const;

export type SolanaNetwork = keyof typeof SOLANA_NETWORKS;

// Get Solana connection
export function getSolanaConnection(network: SolanaNetwork = 'mainnet'): Connection {
  return new Connection(SOLANA_NETWORKS[network], 'confirmed');
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// Get SOL balance
export async function getSolBalance(connection: Connection, publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return lamportsToSol(balance);
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Shorten Solana address for display
export function shortenSolanaAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Wait for transaction confirmation
export async function confirmTransaction(
  connection: Connection,
  signature: string,
  commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
): Promise<boolean> {
  try {
    const result = await connection.confirmTransaction(signature, commitment);
    return !result.value.err;
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
}

// Get recent blockhash (needed for transactions)
export async function getRecentBlockhash(connection: Connection): Promise<string> {
  const { blockhash } = await connection.getLatestBlockhash();
  return blockhash;
}

// Airdrop SOL (Devnet only)
export async function requestAirdrop(
  connection: Connection,
  publicKey: PublicKey,
  amount: number = 1
): Promise<string> {
  const signature = await connection.requestAirdrop(
    publicKey,
    solToLamports(amount)
  );
  await confirmTransaction(connection, signature);
  return signature;
}

