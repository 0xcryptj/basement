import { useState, useEffect, useRef } from "react";
import { Sparkles, Timer, Trophy, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { GameCard } from "./GameCard";
import { BettingInput } from "./BettingInput";
import { PlayerAvatar } from "./PlayerAvatar";
import { CountdownTimer } from "./CountdownTimer";
import { ProvablyFair } from "./ProveablyFair";
import { Confetti } from "@/components/animations/Confetti";
import { WinnerSparkles } from "@/components/animations/WinnerSparkles";
import { useWinnerAnimation } from "@/hooks/useWinnerAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { generateJackpotTicket, generateServerSeed, generatePublicSeed } from "@/lib/provablyFair";

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
  const [balance] = useState(10.5);
  const [lastWinner, setLastWinner] = useState<Player | null>(null);
  const [animatingBet, setAnimatingBet] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { winnerId, showConfetti, showSparkles, celebrateWinner } = useWinnerAnimation();

  useEffect(() => {
    if (!isConnected) return;
    
    const userEntries = players.filter(p => p.id === userId);
    const totalUserWager = userEntries.reduce((sum, p) => sum + p.wager, 0);
    setUserWager(totalUserWager);
    
    if (potSize > 0) {
      setUserChance((totalUserWager / potSize) * 100);
    }
  }, [players, potSize, userId, isConnected]);

  // Countdown timer logic
  useEffect(() => {
    if (players.length < 2 || timeLeft === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [players.length, timeLeft]);

  const handlePlaceBet = async () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: `${userId}-${Date.now()}`,
      username: `Player_${userId?.slice(0, 6)}`,
      wager: wagerAmount,
      chance: 0,
    };

    // Animate new bet
    setAnimatingBet(newPlayer.id);
    setTimeout(() => setAnimatingBet(null), 1000);

    const newPot = potSize + wagerAmount;
    const updatedPlayers = [...players, newPlayer];
    
    // Recalculate all chances with animation
    updatedPlayers.forEach(p => {
      p.chance = (p.wager / newPot) * 100;
    });

    setPlayers(updatedPlayers);
    setPotSize(newPot);

    toast({
      title: "Bet Placed! 🎰",
      description: `You wagered ${wagerAmount} ${network === 'solana' ? 'SOL' : 'ETH'}`,
    });

    // Start countdown when 2 bets are placed
    if (updatedPlayers.length === 2) {
      setTimeLeft(60);
    }

    // Provably fair winner selection after countdown
    if (updatedPlayers.length >= 2 && timeLeft === 0 && !lastWinner) {
      setIsSpinning(true);
      
      setTimeout(() => {
        const serverSeed = generateServerSeed();
        const publicSeed = generatePublicSeed();
        const gameId = `jackpot-${Date.now()}`;
        
        // Calculate max ticket value based on pot size in lamports/wei
        const potInSmallestUnit = Math.floor(newPot * 1e9);
        const result = generateJackpotTicket(serverSeed, publicSeed, gameId, potInSmallestUnit);
        
        // Find winner based on ticket ranges
        let cumulativeTickets = 0;
        let winner = updatedPlayers[0];
        
        for (const player of updatedPlayers) {
          const playerTickets = Math.floor(player.wager * 1e9);
          if (parseInt(result.ticket) < cumulativeTickets + playerTickets) {
            winner = player;
            break;
          }
          cumulativeTickets += playerTickets;
        }

        // Calculate spin offset to land on winner
        const winnerIndex = updatedPlayers.findIndex(p => p.id === winner.id);
        const finalOffset = -(winnerIndex * 120) + (3 * 120 * updatedPlayers.length);
        setSpinOffset(finalOffset);
        
        setTimeout(() => {
          setIsSpinning(false);
          setLastWinner(winner);
          celebrateWinner(winner.id);
          
          toast({
            title: "🎉 WINNER! 🎉",
            description: `${winner.username} won ${(potSize * 0.9).toFixed(4)} ${network === 'solana' ? 'SOL' : 'ETH'}!`,
          });
        }, 4000);
      }, 500);
    }
  };

  const usdValue = (potSize * 150).toFixed(2);
  const sortedPlayers = lastWinner 
    ? [lastWinner, ...players.filter(p => p.id !== lastWinner.id)]
    : players;

  return (
    <>
      <Confetti active={showConfetti} />
      
      <GameCard className="border-primary/30 relative bg-[hsl(220,30%,10%)]" glowColor="cyan">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="font-pixel text-xl text-primary">
                JACKPOT
              </h2>
            </motion.div>
            <p className="font-mono text-xs text-muted-foreground">
              Winner takes all...
            </p>
          </div>

          {/* Pot Display with Animation */}
          <motion.div 
            className="bg-background/30 border border-primary/20 p-4 text-center space-y-1 rounded relative"
            animate={{ 
              scale: animatingBet ? [1, 1.03, 1] : 1,
              borderColor: animatingBet ? ["rgba(0, 245, 255, 0.2)", "rgba(0, 245, 255, 0.5)", "rgba(0, 245, 255, 0.2)"] : undefined
            }}
            transition={{ duration: animatingBet ? 0.5 : 2, repeat: animatingBet ? 0 : Infinity }}
          >
            <div className="font-pixel text-[0.5rem] text-muted-foreground">TOTAL POT</div>
            <motion.div 
              className="font-pixel text-3xl text-primary"
              animate={animatingBet ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {potSize.toFixed(4)}
            </motion.div>
            <div className="font-mono text-xs text-secondary">
              {network === 'solana' ? '◎ SOL' : '⟠ ETH'}
            </div>
            <div className="font-mono text-[0.55rem] text-muted-foreground">
              ≈ ${usdValue} USD
            </div>
          </motion.div>

          {/* Timer and Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <CountdownTimer timeLeft={timeLeft} />
            
            <div className="bg-background/30 border border-accent/20 p-3 text-center rounded">
              <Users className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className="font-pixel text-[0.5rem] text-muted-foreground mb-1">PLAYERS</div>
              <motion.div 
                className="font-pixel text-xl text-accent"
                animate={animatingBet ? { scale: [1, 1.2, 1] } : {}}
              >
                {players.length}
              </motion.div>
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
                className="w-full font-pixel text-xs py-5 bg-primary hover:bg-primary/80 text-primary-foreground border border-primary/30"
              >
                PLACE BET
              </Button>

              {/* User Stats */}
              <motion.div 
                className="grid grid-cols-2 gap-3 bg-background border border-primary/20 p-4"
                animate={animatingBet && userId === animatingBet.split('-')[0] ? { 
                  backgroundColor: ["rgba(0, 0, 0, 0)", "rgba(0, 245, 255, 0.1)", "rgba(0, 0, 0, 0)"] 
                } : {}}
              >
                <div>
                  <div className="font-pixel text-[0.55rem] text-muted-foreground mb-1">YOUR WAGER</div>
                  <motion.div 
                    className="font-mono text-sm text-primary"
                    animate={userWager > 0 ? { scale: [1, 1.1, 1] } : {}}
                  >
                    {userWager.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
                  </motion.div>
                </div>
                <div>
                  <div className="font-pixel text-[0.55rem] text-muted-foreground mb-1">YOUR CHANCE</div>
                  <motion.div 
                    className="font-mono text-sm text-accent"
                    animate={userChance > 0 ? { scale: [1, 1.1, 1] } : {}}
                  >
                    {userChance.toFixed(2)}%
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Jackpot Carousel with Spinning Animation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-xs text-primary">
                {lastWinner ? "LAST WINNER" : "CURRENT PLAYERS"}
              </h3>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            
            {sortedPlayers.length === 0 ? (
              <div className="text-center py-8 bg-background border border-primary/20 text-muted-foreground font-mono text-xs">
                No players yet. Be the first!
              </div>
            ) : (
              <div className="relative">
                {/* Arrow Indicator */}
                <motion.div 
                  className="absolute left-1/2 -translate-x-1/2 -top-6 z-10"
                  animate={{ 
                    y: [0, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ChevronDown className="w-8 h-8 text-accent drop-shadow-glow" />
                </motion.div>
                
                {/* Carousel Container */}
                <div className="relative overflow-hidden bg-background/30 border border-primary/20 rounded-lg py-4 shadow-inner">
                  <motion.div
                    ref={carouselRef}
                    className="flex gap-4 px-4"
                    animate={{
                      x: isSpinning ? spinOffset : 0
                    }}
                    transition={{
                      duration: isSpinning ? 4 : 0.3,
                      ease: isSpinning ? [0.32, 0.72, 0, 1] : "easeOut"
                    }}
                    style={{
                      transform: `translateX(calc(50% - 60px))`
                    }}
                  >
                    {/* Repeat players for continuous effect */}
                    {[...sortedPlayers, ...sortedPlayers, ...sortedPlayers, ...sortedPlayers].map((player, idx) => {
                      const isWinner = player.id === winnerId;
                      const isAnimating = player.id === animatingBet;
                      
                      return (
                        <motion.div
                          key={`${player.id}-${idx}`}
                          className={`shrink-0 w-28 bg-background border p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                            isWinner 
                              ? "border-accent shadow-glow-magenta" 
                              : "border-primary/20"
                          }`}
                          animate={isAnimating ? {
                            scale: [1, 1.05, 1],
                            backgroundColor: ["rgba(0, 0, 0, 0)", "rgba(0, 245, 255, 0.1)", "rgba(0, 0, 0, 0)"]
                          } : isWinner ? {
                            boxShadow: [
                              "0 0 20px rgba(236, 72, 153, 0.5)",
                              "0 0 40px rgba(236, 72, 153, 0.8)",
                              "0 0 20px rgba(236, 72, 153, 0.5)"
                            ]
                          } : {}}
                          transition={{
                            duration: isWinner ? 1.5 : 0.5,
                            repeat: isWinner ? Infinity : 0
                          }}
                        >
                          {isWinner && <WinnerSparkles show={showSparkles} />}
                          
                          <motion.div
                            animate={isWinner ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                            transition={{ duration: 0.5, repeat: isWinner ? Infinity : 0, repeatDelay: 1 }}
                          >
                            <PlayerAvatar
                              username={player.username}
                              avatarUrl={player.avatar}
                              size="md"
                              ringColor={isWinner ? "accent" : "primary"}
                            />
                          </motion.div>
                          
                          <div className="text-center w-full">
                            <div className={`font-mono text-xs truncate ${isWinner ? "text-accent font-bold" : "text-foreground"}`}>
                              {player.username}
                              {isWinner && " 🏆"}
                            </div>
                            <motion.div 
                              className="font-mono text-[0.6rem] text-muted-foreground"
                              animate={isAnimating ? { scale: [1, 1.15, 1] } : {}}
                            >
                              {player.wager.toFixed(3)} {network === 'solana' ? 'SOL' : 'ETH'}
                            </motion.div>
                            <motion.div 
                              className={`font-pixel text-xs ${isWinner ? "text-accent" : "text-primary"} mt-1`}
                              animate={isAnimating || isWinner ? { scale: [1, 1.2, 1] } : {}}
                            >
                              {player.chance.toFixed(1)}%
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
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
    </>
  );
};