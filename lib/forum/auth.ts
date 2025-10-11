import { createHash } from 'crypto';
import { CONFIG } from './constants';

/**
 * Generate a rotating anonymous ID from wallet address
 * Rotates daily to prevent long-term tracking while proving same poster for a day
 */
export function generateAnonId(
  walletAddress: string,
  date: Date = new Date()
): string {
  if (!walletAddress) {
    return 'Anonymous';
  }

  // Get date string in YYYY-MM-DD format
  const dateStr = date.toISOString().split('T')[0];

  // Hash wallet + salt + date
  const hash = createHash('sha256')
    .update(walletAddress.toLowerCase() + CONFIG.SERVER_SALT + dateStr)
    .digest('hex');

  // Return first 8 characters as anon ID
  return hash.slice(0, 8);
}

/**
 * Hash IP address for ban tracking (never store raw IP)
 */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + CONFIG.SERVER_SALT)
    .digest('hex');
}

/**
 * Validate wallet address format (Ethereum)
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get wallet address from session/request
 * This should integrate with your existing wallet auth system
 */
export function getWalletFromSession(req: any): string | null {
  // TODO: Integrate with existing wagmi/viem wallet session
  // For now, check for wallet in session, headers, or cookies
  
  const wallet = 
    req.session?.wallet ||
    req.headers?.['x-wallet-address'] ||
    req.cookies?.wallet;

  if (wallet && isValidWalletAddress(wallet)) {
    return wallet;
  }

  return null;
}

/**
 * Check if user is admin
 */
export async function isAdmin(walletAddress: string): Promise<boolean> {
  if (!walletAddress) return false;

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const admin = await prisma.admin.findUnique({
      where: { walletAddr: walletAddress.toLowerCase() },
    });

    await prisma.$disconnect();
    return !!admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

