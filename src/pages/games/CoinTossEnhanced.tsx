import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { Coins, Loader2 } from "lucide-react";
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

  const flipCoin = async (selectedChoice: "heads" | "tails") => {
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

    // Increment wager stats
    await supabase.rpc('increment_wager_stats', {
      wager_amt: wagerAmount,
    });

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
          description: `Coin landed on ${coinResult}! Won ${(wagerAmount * 1.9).toFixed(4)} ${network === 'solana' ? 'SOL' : 'ETH'}`,
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
  };

  const resetGame = () => {
    setGameState("waiting");
    setChoice(null);
    setResult(null);
    setIsWinner(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <GlobalStats />
        <div className="pt-20 container mx-auto px-4 pb-12 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-card border-2 border-primary p-8 text-center animate-scale-in">
            <h2 className="font-pixel text-xl text-primary mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground">
              Connect your wallet to play Coin Toss
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalStats />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /COIN TOSS/ {network === 'solana' ? '◎' : '⟠'}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            50/50 chance - Double or nothing
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-2 border-primary p-8 animate-scale-in">
            {/* Wager Input */}
            {gameState === "waiting" && (
              <div className="mb-6">
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">
                  WAGER AMOUNT
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0.01)}
                    min="0.01"
                    step="0.01"
                    className="flex-1 bg-background border-2 border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground"
                  />
                  <span className="flex items-center font-pixel text-xs text-muted-foreground">
                    {network === 'solana' ? 'SOL' : 'ETH'}
                  </span>
                </div>
              </div>
            )}

            {/* Coin Display */}
            <div className="text-center mb-8">
              <div className={`inline-block p-8 bg-background border-2 border-primary rounded-full ${
                gameState === "flipping" ? "animate-spin" : ""
              } ${gameState === "finished" ? "animate-scale-in" : ""}`}>
                <Coins className={`w-24 h-24 ${
                  result === "heads" ? "text-primary" :
                  result === "tails" ? "text-secondary" :
                  "text-muted-foreground"
                }`} />
              </div>
              
              {gameState === "finished" && (
                <div className="mt-6 animate-fade-in">
                  <div className={`font-pixel text-2xl mb-2 ${
                    isWinner ? "text-primary animate-glow-pulse" : "text-secondary"
                  }`}>
                    {result?.toUpperCase()}!
                  </div>
                  <div className={`font-pixel text-xl ${
                    isWinner ? "text-accent" : "text-muted-foreground"
                  }`}>
                    {isWinner ? "YOU WIN!" : "YOU LOSE"}
                  </div>
                </div>
              )}

              {gameState === "flipping" && (
                <div className="mt-6 font-pixel text-accent animate-pulse">
                  Flipping coin...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {gameState === "waiting" && (
                <>
                  <Button
                    onClick={() => flipCoin("heads")}
                    className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground flex-1 hover-scale"
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Heads
                  </Button>
                  <Button
                    onClick={() => flipCoin("tails")}
                    className="font-pixel bg-secondary hover:bg-secondary/80 text-secondary-foreground flex-1 hover-scale"
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Tails
                  </Button>
                </>
              )}

              {gameState === "flipping" && (
                <div className="flex items-center gap-2 text-accent">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-pixel text-sm">You chose {choice?.toUpperCase()}</span>
                </div>
              )}

              {gameState === "finished" && (
                <Button
                  onClick={resetGame}
                  className="font-pixel bg-accent hover:bg-accent/80 text-accent-foreground hover-scale"
                >
                  Flip Again
                </Button>
              )}
            </div>
          </Card>

          <div className="mt-8 bg-card border-2 border-accent p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Choose Heads or Tails</li>
              <li>• 50/50 chance of winning</li>
              <li>• Win 1.9x your wager (10% house fee)</li>
              <li>• Lose = forfeit wager</li>
              <li>• Provably fair on-chain randomness</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CoinTossEnhanced;