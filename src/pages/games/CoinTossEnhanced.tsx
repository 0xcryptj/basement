import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { Coins, Loader2, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSound } from "@/hooks/useSound";
import { supabase } from "@/integrations/supabase/client";

const CoinTossEnhanced = () => {
  const { toast } = useToast();
  const { isConnected, userId, network } = useWallet();
  const { play } = useSound();
  const [gameState, setGameState] = useState<"waiting" | "flipping" | "finished">("waiting");
  const [choice, setChoice] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [wagerAmount, setWagerAmount] = useState(0.01);

  // Memoized calculations
  const potentialWin = useMemo(() => (wagerAmount * 1.9).toFixed(4), [wagerAmount]);
  const currency = useMemo(() => network === 'solana' ? 'SOL' : 'ETH', [network]);

  const flipCoin = useCallback(async (selectedChoice: "heads" | "tails") => {
    if (!userId || !network) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setChoice(selectedChoice);
    setGameState("flipping");
    play('coinFlip');

    // Increment wager stats with error handling
    try {
      await supabase.rpc('increment_wager_stats', {
        wager_amt: wagerAmount,
      });
    } catch (error) {
      console.error('Stats error:', error);
    }

    setTimeout(() => {
      const coinResult = Math.random() > 0.5 ? "heads" : "tails";
      const won = coinResult === selectedChoice;
      
      setResult(coinResult);
      setIsWinner(won);
      setGameState("finished");

      if (won) {
        play('win');
        toast({
          title: "🎉 You Win! 🎉",
          description: `Coin landed on ${coinResult}! Won ${potentialWin} ${currency}`,
        });
      } else {
        play('lose');
        toast({
          title: "Better Luck Next Time",
          description: `Coin landed on ${coinResult}`,
          variant: "destructive",
        });
      }
    }, 2000);
  }, [userId, network, wagerAmount, potentialWin, currency, toast, play]);

  const resetGame = useCallback(() => {
    setGameState("waiting");
    setChoice(null);
    setResult(null);
    setIsWinner(false);
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <GlobalStats />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <Card className="w-full max-w-md bg-card border-2 border-primary p-6 sm:p-8 text-center animate-scale-in shadow-glow-cyan">
            <Coins className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-primary animate-glow-pulse" />
            <h2 className="font-pixel text-base sm:text-xl text-primary mb-3 sm:mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              Connect your wallet to start playing Coin Toss
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <GlobalStats />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-screen-lg mx-auto w-full">
          {/* Header Section */}
          <header className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 sm:mb-4 animate-glow-pulse">
              /COIN TOSS/ {network === 'solana' ? '◎' : '⟠'}
            </h1>
            <p className="font-mono text-sm sm:text-base text-muted-foreground">
              50/50 chance - Double or nothing
            </p>
          </header>

          {/* Game Container */}
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <Card className="bg-card border-2 border-primary p-4 sm:p-6 lg:p-8 animate-scale-in shadow-glow-cyan">
              {/* Wager Input - Mobile First */}
              {gameState === "waiting" && (
                <div className="mb-6 sm:mb-8">
                  <label htmlFor="wager-input" className="font-pixel text-xs sm:text-sm text-muted-foreground mb-2 block uppercase">
                    Wager Amount
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <input
                        id="wager-input"
                        type="number"
                        value={wagerAmount}
                        onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0.01)}
                        min="0.01"
                        step="0.01"
                        aria-label="Wager amount"
                        className="w-full bg-background border-2 border-primary/30 focus:border-primary rounded-lg px-4 py-3 font-mono text-sm sm:text-base text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-pixel text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        {currency}
                      </span>
                      <div className="flex items-center gap-1 text-accent text-xs sm:text-sm">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-mono">1.9x</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Potential win: {potentialWin} {currency}
                  </p>
                </div>
              )}

              {/* Coin Display - Responsive */}
              <div className="text-center mb-6 sm:mb-8" role="region" aria-live="polite" aria-label="Coin flip result">
                <div className={`inline-flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-background border-2 border-primary rounded-full transition-all duration-300 ${
                  gameState === "flipping" ? "animate-spin" : ""
                } ${gameState === "finished" ? "animate-scale-in shadow-glow-cyan" : ""}`}>
                  <Coins 
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transition-colors duration-300 ${
                      result === "heads" ? "text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" :
                      result === "tails" ? "text-secondary drop-shadow-[0_0_10px_hsl(var(--secondary))]" :
                      "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                
                {gameState === "finished" && (
                  <div className="mt-4 sm:mt-6 animate-fade-in space-y-2">
                    <div className={`font-pixel text-xl sm:text-2xl lg:text-3xl ${
                      isWinner ? "text-primary animate-glow-pulse" : "text-secondary"
                    }`}>
                      {result?.toUpperCase()}!
                    </div>
                    <div className={`font-pixel text-lg sm:text-xl lg:text-2xl ${
                      isWinner ? "text-accent" : "text-muted-foreground"
                    }`}>
                      {isWinner ? "YOU WIN!" : "YOU LOSE"}
                    </div>
                    {isWinner && (
                      <p className="font-mono text-sm sm:text-base text-accent mt-2">
                        +{potentialWin} {currency}
                      </p>
                    )}
                  </div>
                )}

                {gameState === "flipping" && (
                  <div className="mt-4 sm:mt-6 font-pixel text-sm sm:text-base text-accent animate-pulse">
                    Flipping coin...
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile First */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {gameState === "waiting" && (
                  <>
                    <Button
                      onClick={() => flipCoin("heads")}
                      className="w-full sm:flex-1 font-pixel text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground py-3 sm:py-4 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-glow-cyan"
                      aria-label="Choose heads"
                    >
                      <Coins className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Heads
                    </Button>
                    <Button
                      onClick={() => flipCoin("tails")}
                      className="w-full sm:flex-1 font-pixel text-sm sm:text-base bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 sm:py-4 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-secondary/50 shadow-glow-purple"
                      aria-label="Choose tails"
                    >
                      <Coins className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Tails
                    </Button>
                  </>
                )}

                {gameState === "flipping" && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-accent py-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="font-pixel text-xs sm:text-sm">You chose {choice?.toUpperCase()}</span>
                  </div>
                )}

                {gameState === "finished" && (
                  <Button
                    onClick={resetGame}
                    className="w-full sm:w-auto font-pixel text-sm sm:text-base bg-accent hover:bg-accent/90 text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-accent/50 shadow-glow-magenta"
                    aria-label="Flip coin again"
                  >
                    Flip Again
                  </Button>
                )}
              </div>
            </Card>

            {/* Rules Card - Responsive */}
            <Card className="bg-card border-2 border-accent/50 p-4 sm:p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-pixel text-xs sm:text-sm text-accent mb-3 sm:mb-4 uppercase flex items-center gap-2">
                <Info className="w-4 h-4" />
                Game Rules
              </h3>
              <ul className="font-mono text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Choose Heads or Tails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>50/50 chance of winning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Win 1.9x your wager (10% house fee)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Lose = forfeit wager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Provably fair on-chain randomness</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CoinTossEnhanced;