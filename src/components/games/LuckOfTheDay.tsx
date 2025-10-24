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
    <GameCard className="border-accent relative overflow-hidden border-glow" glowColor="magenta">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
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
              delay: i * 0.2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header with Animation */}
        <motion.div
          className="text-center space-y-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-accent animate-pulse" />
            <h3 className="font-pixel text-sm text-accent animate-glow-pulse">
              LUCK OF THE DAY
            </h3>
            <Zap className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <div className="font-mono text-xs text-muted-foreground italic">
            Against all odds...
          </div>
        </motion.div>

        {/* Winner Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background border-2 border-accent/30 p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <PlayerAvatar
                username={winner.username}
                avatarUrl={winner.avatarUrl}
                size="lg"
                ringColor="accent"
              />
            </motion.div>
            <div className="flex-1">
              <div className="font-pixel text-sm text-foreground">{winner.username}</div>
              <div className="font-mono text-xs text-muted-foreground">{winner.game}</div>
            </div>
            <Trophy className="w-8 h-8 text-accent animate-pulse" />
          </div>

          {/* Win Details */}
          <div className="bg-card/50 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[0.6rem] text-muted-foreground">WON</span>
              <span className="font-mono text-lg text-accent">
                +{winner.amount.toFixed(4)} {winner.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[0.6rem] text-muted-foreground">WITH ODDS</span>
              <motion.span
                className="font-pixel text-sm text-destructive"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {winner.chance.toFixed(2)}%
              </motion.span>
            </div>
          </div>

          {/* Epic Win Badge */}
          <motion.div
            className="bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/50 p-2 text-center"
            animate={{ boxShadow: ["0 0 10px rgba(236, 72, 153, 0.3)", "0 0 20px rgba(236, 72, 153, 0.6)", "0 0 10px rgba(236, 72, 153, 0.3)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="font-pixel text-[0.5rem] text-accent">
              ⭐ LEGENDARY WIN ⭐
            </div>
          </motion.div>
        </motion.div>
      </div>
    </GameCard>
  );
};