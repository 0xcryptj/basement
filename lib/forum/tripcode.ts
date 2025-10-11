import { createHash } from 'crypto';
import { CONFIG } from './constants';

/**
 * Generate a short tripcode signature from a trip string
 * Returns a short identifier like !k3f89A
 */
export function generateTripcode(tripString: string): string {
  if (!tripString || tripString.trim().length === 0) {
    return '';
  }

  const hash = createHash('sha256')
    .update(tripString + CONFIG.SERVER_SALT)
    .digest('base64url');

  // Take first 6 characters and prepend with !
  return '!' + hash.slice(0, 6);
}

/**
 * Validate tripcode format
 */
export function isValidTripcode(tripSig: string): boolean {
  return /^![A-Za-z0-9_-]{6}$/.test(tripSig);
}

