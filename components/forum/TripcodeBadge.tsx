'use client';

interface TripcodeBadgeProps {
  tripSig: string;
}

export default function TripcodeBadge({ tripSig }: TripcodeBadgeProps) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-mono font-bold rounded ml-1"
      style={{
        backgroundColor: '#10b981',
        color: '#fff',
      }}
      title="Tripcode"
    >
      {tripSig}
    </span>
  );
}

