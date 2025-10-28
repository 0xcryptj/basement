// House wallet addresses for fee routing
export const HOUSE_WALLETS = {
  solana: "bLTgi8oDjiE2zwV3ym15gHDwAnn2NqZ1ScfQZERoyYf",
  base: "0x5CAdda44709251088663E94b13ad3d5E38466b4d",
} as const;

// Smart contract addresses (Base Mainnet)
export const CONTRACT_ADDRESSES = {
  Chess: "0x429e6BF43b9127A9Ee95FD17f17213a35252488b",
  Connect4: "0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5",
  War: "0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC",
} as const;

// Token addresses
export const TOKEN_ADDRESSES = {
  solana: "D4MXRKhzSMapDZ5bLEA1bmjrUPLZhHZRhSkS6wrBpump",
  base: "0xfd730abb25c17e5bccf3bad3016ccc861bffbc7b",
} as const;

// House fee percentage (10%)
export const HOUSE_FEE_PERCENT = 0.1;

/**
 * Calculate house fee and payout amounts
 */
export const calculateFees = (wagerAmount: number) => {
  const houseFee = wagerAmount * HOUSE_FEE_PERCENT;
  const payout = wagerAmount - houseFee;
  return { houseFee, payout };
};
