import { Trophy, TrendingUp } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import { motion, AnimatePresence } from "framer-motion";

interface Winner {
  id: string;
  username: string;
  avatarUrl?: string;
  amount: number;
  chance: number;
  timestamp: string;
  currency: string;
}

interface WinnerHistoryProps {
  winners: Winner[];
  maxDisplay?: number;
}

export const WinnerHistory = ({ winners, maxDisplay = 5 }: WinnerHistoryProps) => {
  const displayedWinners = winners.slice(0, maxDisplay);

  return (
    <div className="bg-background border-2 border-accent/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-pixel text-xs text-accent">RECENT WINNERS</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-accent/50" />
      </div>

      {displayedWinners.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-mono text-xs">
          No winners yet...
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displayedWinners.map((winner, idx) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card/50 border border-accent/20 p-3 flex items-center justify-between hover:bg-card/70 hover-scale"
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar
                    username={winner.username}
                    avatarUrl={winner.avatarUrl}
                    size="sm"
                    ringColor="accent"
                  />
                  <div>
                    <div className="font-mono text-xs text-foreground">{winner.username}</div>
                    <div className="font-mono text-[0.6rem] text-muted-foreground">
                      {winner.chance.toFixed(2)}% odds
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-pixel text-xs text-accent">
                    +{winner.amount.toFixed(4)}
                  </div>
                  <div className="font-mono text-[0.6rem] text-muted-foreground">
                    {winner.currency}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};