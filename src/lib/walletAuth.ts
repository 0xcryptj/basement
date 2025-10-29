import { ethers } from 'ethers';

/**
 * Verify a signed message from a wallet
 * @param message The original message that was signed
 * @param signature The signature from the wallet
 * @param expectedAddress The address that should have signed the message
 * @returns boolean indicating if the signature is valid
 */
export const verifySignature = (
  message: string,
  signature: string,
  expectedAddress: string
): boolean => {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Generate a message for wallet authentication
 * @param address The wallet address
 * @returns The authentication message
 */
export const generateAuthMessage = (address: string): string => {
  return `The Basement wants you to sign in with your Ethereum account:\n${address}\n\nSign in to The Basement\nURI: ${window.location.origin}\nVersion: 1\nChain ID: 8453\nNonce: ${Date.now()}`;
};

/**
 * Extract the message from a potential EIP-191 prefixed message
 * @param message The raw message
 * @returns The message without prefix if present
 */
export const normalizeMessage = (message: string): string => {
  // Remove EIP-191 prefix if present
  if (message.startsWith('\x19Ethereum Signed Message:\n')) {
    return message.substring(message.indexOf('\n') + 1);
  }
  return message;
};

