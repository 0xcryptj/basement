import crypto from 'crypto-js';

export interface ProvablyFairResult {
  ticket: string;
  result: string;
  serverSeed: string;
  publicSeed: string;
  gameId: string;
}

// Jackpot provably fair logic
export function generateJackpotTicket(
  serverSeed: string,
  publicSeed: string,
  gameId: string,
  maxValue: number
): ProvablyFairResult {
  const hash = crypto.SHA512(`${serverSeed}-${publicSeed}-${gameId}`).toString();
  const ticket = seededRandomBigInt(hash, BigInt(0), BigInt(maxValue));
  
  return {
    ticket: ticket.toString(),
    result: ticket.toString(),
    serverSeed,
    publicSeed,
    gameId
  };
}

// Coinflip provably fair logic
export function generateCoinflipResult(
  serverSeed: string,
  publicSeed: string,
  gameId: string
): ProvablyFairResult {
  const min = 0;
  const max = (100 * 10000) - 1; // 999,999
  const hash = crypto.SHA512(`${serverSeed}-${publicSeed}-${gameId}`).toString();
  const ticket = seededRandomInteger(hash, min, max);
  const winnerSide = ticket < 500_000 ? "HEADS" : "TAILS";
  
  return {
    ticket: ticket.toString(),
    result: winnerSide,
    serverSeed,
    publicSeed,
    gameId
  };
}

function seededRandomBigInt(hash: string, min: bigint, max: bigint): bigint {
  // Take first 16 characters (64 bits) of hash
  const uintValue = BigInt("0x" + hash.slice(0, 16));
  const range = max - min + BigInt(1);
  return min + (uintValue % range);
}

function seededRandomInteger(hash: string, min: number, max: number): number {
  // Take first 16 characters (64 bits) of hash
  const uintValue = parseInt(hash.slice(0, 16), 16);
  const range = max - min + 1;
  return min + (uintValue % range);
}

// Generate random server seed
export function generateServerSeed(): string {
  return crypto.lib.WordArray.random(32).toString();
}

// Generate random public seed
export function generatePublicSeed(): string {
  return crypto.lib.WordArray.random(16).toString();
}
