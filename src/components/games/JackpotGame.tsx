import { useState, useEffect } from "react";
import { Sparkles, Timer, Trophy, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { GameCard } from "./GameCard";
import { BettingInput } from "./BettingInput";
import { PlayerAvatar } from "./PlayerAvatar";
import { CountdownTimer } from "./CountdownTimer";
import { ProvablyFair } from "./ProveablyFair";
import { motion } from "framer-motion";

interface Player {
  id: string;
  username: string;
  avatar?: string;
  wager: number;
  chance: number;
}

export const JackpotGame = () => {
  const { toast } = useToast();
  const { isConnected, userId, network } = useWallet();
  const [potSize, setPotSize] = useState(0);
  const [wagerAmount, setWagerAmount] = useState(0.1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [userChance, setUserChance] = useState(0);
  const [userWager, setUserWager] = useState(0);
  const [balance] = useState(10.5); // Mock balance

  useEffect(() => {
    if (!isConnected) return;
    
    // Calculate user's total wager and chance
    const userEntries = players.filter(p => p.id === userId);
    const totalUserWager = userEntries.reduce((sum, p) => sum + p.wager, 0);
    setUserWager(totalUserWager);
    
    if (potSize > 0) {
      setUserChance((totalUserWager / potSize) * 100);
    }
  }, [players, potSize, userId, isConnected]);

  const handlePlaceBet = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      });
      return;
    }

    // Add player to list
    const newPlayer: Player = {
      id: userId!,
      username: `Player_${userId?.slice(0, 6)}`,
      wager: wagerAmount,
      chance: 0,
    };

    const newPot = potSize + wagerAmount;
    const updatedPlayers = [...players, newPlayer];
    
    // Recalculate all chances
    updatedPlayers.forEach(p => {
      p.chance = (p.wager / newPot) * 100;
    });

    setPlayers(updatedPlayers);
    setPotSize(newPot);

    toast({
      title: "Bet Placed!",
      description: `You wagered ${wagerAmount} ${network === 'solana' ? 'SOL' : 'ETH'}`,
    });
  };

  const usdValue = (potSize * 150).toFixed(2); // Mock USD conversion

  return (
    <GameCard className="border-primary" glowColor="cyan">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3"
          >
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="font-pixel text-2xl text-primary animate-glow-pulse">
              JACKPOT
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </motion.div>
          <p className="font-mono text-sm text-muted-foreground italic">
            Winner takes all...
          </p>
        </div>

        {/* Pot Display */}
        <motion.div 
          className="bg-background border-2 border-primary/30 p-6 text-center space-y-2"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="font-pixel text-xs text-muted-foreground">TOTAL POT</div>
          <div className="font-pixel text-5xl text-primary animate-glow-pulse">
            {potSize.toFixed(4)}
          </div>
          <div className="font-mono text-sm text-secondary">
            {network === 'solana' ? '◎ SOL' : '⟠ ETH'}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            ≈ ${usdValue} USD
          </div>
        </motion.div>

        {/* Timer and Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <CountdownTimer timeLeft={timeLeft} />
          
          <div className="bg-background border-2 border-accent p-4 text-center">
            <Users className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="font-pixel text-[0.6rem] text-muted-foreground mb-2">PLAYERS</div>
            <div className="font-pixel text-2xl text-accent">{players.length}</div>
          </div>
        </div>

        {/* Betting Input */}
        {isConnected && (
          <div className="space-y-4">
            <BettingInput
              value={wagerAmount}
              onChange={setWagerAmount}
              currency={network === 'solana' ? 'SOL' : 'ETH'}
              balance={balance}
              min={0.01}
              max={balance}
            />

            <Button
              onClick={handlePlaceBet}
              disabled={wagerAmount > balance}
              className="w-full font-pixel text-sm py-6 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/80 hover:to-secondary/80 shadow-glow-cyan border-2 border-primary hover-scale"
            >
              PLACE BET
            </Button>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-3 bg-background border border-primary/20 p-4">
              <div>
                <div className="font-pixel text-[0.55rem] text-muted-foreground mb-1">YOUR WAGER</div>
                <div className="font-mono text-sm text-primary">
                  {userWager.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
                </div>
              </div>
              <div>
                <div className="font-pixel text-[0.55rem] text-muted-foreground mb-1">YOUR CHANCE</div>
                <div className="font-mono text-sm text-accent">
                  {userChance.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xs text-primary">CURRENT PLAYERS</h3>
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          
          {players.length === 0 ? (
            <div className="text-center py-8 bg-background border border-primary/20 text-muted-foreground font-mono text-xs">
              No players yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {players.map((player, idx) => (
                <motion.div
                  key={`${player.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-background border border-primary/20 p-3 flex items-center justify-between hover:bg-background/70 hover-scale"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      username={player.username}
                      avatarUrl={player.avatar}
                      size="sm"
                    />
                    <div>
                      <div className="font-mono text-sm text-foreground">{player.username}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {player.wager.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-pixel text-sm text-primary">{player.chance.toFixed(2)}%</div>
                    <div className="font-mono text-xs text-muted-foreground">chance</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Provably Fair */}
        <ProvablyFair
          roundId="abc123def456"
          serverSeed="a1b2c3d4e5f6..."
          blockHash="9x8y7z6..."
        />
      </div>
    </GameCard>
  );
};