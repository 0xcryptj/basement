'use client';

interface AnonIdBadgeProps {
  anonId: string;
  showFull?: boolean;
}

export default function AnonIdBadge({ anonId, showFull = false }: AnonIdBadgeProps) {
  // Check if it's a wallet address (0x...)
  const isWalletAddress = anonId.startsWith('0x') && anonId.length === 42;

  const displayId = isWalletAddress && !showFull
    ? `${anonId.slice(0, 6)}...${anonId.slice(-4)}`
    : anonId;

  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-mono rounded"
      style={{
        backgroundColor: isWalletAddress ? '#ec4899' : '#8b5cf6',
        color: '#fff',
      }}
      title={isWalletAddress ? anonId : `Anonymous ID: ${anonId}`}
    >
      {isWalletAddress ? '🔗' : 'ID:'} {displayId}
    </span>
  );
}

