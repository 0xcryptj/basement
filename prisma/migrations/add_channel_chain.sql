-- Add chain support to Channel table
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "chain" TEXT DEFAULT 'base';
ALTER TABLE "Channel" ADD COLUMN IF NOT EXISTS "burnTxSignature" TEXT;

-- Create index for chain queries
CREATE INDEX IF NOT EXISTS "Channel_chain_idx" ON "Channel"("chain");

-- Add check constraint for valid chains
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_chain_check" CHECK ("chain" IN ('base', 'solana'));

