// House wallet addresses for fee routing
export const HOUSE_WALLETS = {
  solana: "bLTgi8oDjiE2zwV3ym15gHDwAnn2NqZ1ScfQZERoyYf",
  base: "0x0F030f98b1F3cE9DA7054AC9CD454d2a816b5B03",
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
