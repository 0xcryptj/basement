import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CoinToss = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"waiting" | "flipping" | "finished">("waiting");
  const [playerChoice, setPlayerChoice] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);

  const flipCoin = (choice: "heads" | "tails") => {
    setPlayerChoice(choice);
    setGameState("flipping");
    
    setTimeout(() => {
      const coinResult = Math.random() > 0.5 ? "heads" : "tails";
      setResult(coinResult);
      const won = choice === coinResult;
      setIsWinner(won);
      setGameState("finished");
      
      if (won) {
        toast({ title: "You Won!", description: "Congratulations on your win!" });
      } else {
        toast({ title: "You Lost", description: "Better luck next time!" });
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameState("waiting");
    setPlayerChoice(null);
    setResult(null);
    setIsWinner(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /COIN TOSS/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            50/50 chance - Double or nothing
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-2 border-primary p-8">
            <div className="text-center mb-8">
              <div className="h-48 flex items-center justify-center mb-6">
                {gameState === "flipping" ? (
                  <Coins className="w-32 h-32 text-primary animate-spin" />
                ) : result ? (
                  <div className={`font-pixel text-6xl ${isWinner ? "text-primary" : "text-accent"}`}>
                    {result === "heads" ? "H" : "T"}
                  </div>
                ) : (
                  <Coins className="w-32 h-32 text-muted-foreground" />
                )}
              </div>

              {isWinner !== null && (
                <h2 className="font-pixel text-2xl mb-4 animate-glow-pulse">
                  {isWinner ? (
                    <span className="text-primary">YOU WIN!</span>
                  ) : (
                    <span className="text-accent">YOU LOSE!</span>
                  )}
                </h2>
              )}

              {result && (
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  Coin landed on: <span className="text-secondary uppercase">{result}</span>
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {gameState === "waiting" && (
                <>
                  <Button
                    onClick={() => flipCoin("heads")}
                    className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground"
                  >
                    Heads
                  </Button>
                  <Button
                    onClick={() => flipCoin("tails")}
                    className="font-pixel bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  >
                    Tails
                  </Button>
                </>
              )}
              {gameState === "flipping" && (
                <div className="font-pixel text-accent animate-pulse">
                  Flipping coin...
                </div>
              )}
              {gameState === "finished" && (
                <Button
                  onClick={resetGame}
                  className="font-pixel bg-accent hover:bg-accent/80 text-accent-foreground"
                >
                  Flip Again
                </Button>
              )}
            </div>
          </Card>

          <div className="mt-8 bg-card border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Choose heads or tails</li>
              <li>• 50/50 chance to win</li>
              <li>• Winner takes 90% of pot</li>
              <li>• 10% house fee on winnings</li>
              <li>• Provably fair randomness</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CoinToss;
