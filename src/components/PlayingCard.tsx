interface PlayingCardProps {
  rank: number;
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  isRevealed?: boolean;
  className?: string;
}

const SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-foreground',
  spades: 'text-foreground',
};

const RANK_NAMES = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const PlayingCard = ({ rank, suit = 'spades', isRevealed = true, className = '' }: PlayingCardProps) => {
  if (!isRevealed) {
    return (
      <div className={`relative w-32 h-44 bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center animate-scale-in ${className}`}>
        <div className="absolute inset-2 bg-gradient-to-br from-primary/40 to-secondary/40 rounded pattern-diagonal-lines"></div>
        <div className="font-pixel text-2xl text-primary z-10">?</div>
      </div>
    );
  }

  const rankName = RANK_NAMES[rank] || rank.toString();
  const suitSymbol = SUITS[suit];
  const suitColor = SUIT_COLORS[suit];

  return (
    <div className={`relative w-32 h-44 bg-card border-2 border-primary rounded-lg p-3 flex flex-col animate-scale-in shadow-glow-cyan ${className}`}>
      {/* Top rank and suit */}
      <div className="flex flex-col items-center">
        <span className={`font-pixel text-2xl ${suitColor}`}>{rankName}</span>
        <span className={`text-3xl ${suitColor}`}>{suitSymbol}</span>
      </div>

      {/* Center suit symbol */}
      <div className="flex-1 flex items-center justify-center">
        <span className={`text-6xl ${suitColor} animate-pulse`}>{suitSymbol}</span>
      </div>

      {/* Bottom rank and suit (rotated) */}
      <div className="flex flex-col items-center rotate-180">
        <span className={`font-pixel text-2xl ${suitColor}`}>{rankName}</span>
        <span className={`text-3xl ${suitColor}`}>{suitSymbol}</span>
      </div>
    </div>
  );
};