import { Trophy, Star, Zap } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import { GameCard } from "./GameCard";
import { motion } from "framer-motion";

interface LuckWinner {
  username: string;
  avatarUrl?: string;
  amount: number;
  chance: number;
  currency: string;
  game: string;
}

interface LuckOfTheDayProps {
  winner?: LuckWinner;
}

export const LuckOfTheDay = ({ winner }: LuckOfTheDayProps) => {
  if (!winner) {
    return (
      <GameCard className="border-accent relative overflow-hidden" glowColor="magenta">
        <div className="text-center py-8 space-y-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-12 h-12 text-accent mx-auto" />
          </motion.div>
          <h3 className="font-pixel text-sm text-accent">LUCK OF THE DAY</h3>
          <p className="font-mono text-xs text-muted-foreground">
            Waiting for a legendary win...
          </p>
        </div>
      </GameCard>
    );
  }

  return (
    <GameCard className="border-accent/30 relative overflow-hidden" glowColor="magenta">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star className="w-3 h-3 text-accent" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <motion.div
          className="space-y-1"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <h3 className="font-pixel text-xs text-accent">
              LUCK OF THE DAY
            </h3>
          </div>
          <div className="font-mono text-[0.6rem] text-muted-foreground">
            Against all odds...
          </div>
        </motion.div>

        {/* Winner Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background/30 border border-accent/30 p-3 space-y-3 rounded"
        >
          <div className="flex items-center gap-3">
            <PlayerAvatar
              username={winner.username}
              avatarUrl={winner.avatarUrl}
              size="md"
              ringColor="accent"
              level={56}
            />
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-xs text-foreground truncate">{winner.username}</div>
              <div className="font-mono text-[0.6rem] text-muted-foreground">{winner.game}</div>
            </div>
            <Trophy className="w-6 h-6 text-accent flex-shrink-0" />
          </div>

          {/* Win Details */}
          <div className="bg-background/50 p-2 space-y-2 rounded">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[0.5rem] text-muted-foreground">WON</span>
              <span className="font-mono text-sm text-accent">
                +{winner.amount.toFixed(4)} {winner.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[0.5rem] text-muted-foreground">ODDS</span>
              <span className="font-pixel text-xs text-destructive">
                {winner.chance.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Epic Win Badge */}
          <div className="bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/40 p-1.5 text-center rounded">
            <div className="font-pixel text-[0.45rem] text-accent">
              ⭐ LEGENDARY WIN ⭐
            </div>
          </div>
        </motion.div>
      </div>
    </GameCard>
  );
};