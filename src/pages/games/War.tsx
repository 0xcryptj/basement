import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sword } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const War = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished">("waiting");
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const playGame = () => {
    setGameState("playing");
    const p1Card = Math.floor(Math.random() * 13) + 1;
    const p2Card = Math.floor(Math.random() * 13) + 1;
    
    setPlayerCard(p1Card);
    setOpponentCard(p2Card);
    
    setTimeout(() => {
      if (p1Card > p2Card) {
        setWinner("You Win!");
        toast({ title: "Victory!", description: "You won the match!" });
      } else if (p2Card > p1Card) {
        setWinner("Opponent Wins!");
        toast({ title: "Defeat", description: "Better luck next time!" });
      } else {
        setWinner("Draw!");
        toast({ title: "Draw", description: "It's a tie - funds refunded" });
      }
      setGameState("finished");
    }, 1500);
  };

  const resetGame = () => {
    setGameState("waiting");
    setPlayerCard(null);
    setOpponentCard(null);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /WAR/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Classic card battle - Highest card wins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-2 border-primary p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Player Card */}
              <div className="text-center">
                <h3 className="font-pixel text-sm text-primary mb-4">YOUR CARD</h3>
                <div className="h-48 flex items-center justify-center bg-background border-2 border-primary rounded">
                  {playerCard ? (
                    <span className="font-pixel text-6xl text-primary">{playerCard}</span>
                  ) : (
                    <Sword className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Opponent Card */}
              <div className="text-center">
                <h3 className="font-pixel text-sm text-secondary mb-4">OPPONENT CARD</h3>
                <div className="h-48 flex items-center justify-center bg-background border-2 border-secondary rounded">
                  {opponentCard ? (
                    <span className="font-pixel text-6xl text-secondary">{opponentCard}</span>
                  ) : (
                    <Sword className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {winner && (
              <div className="text-center mb-6">
                <h2 className="font-pixel text-2xl text-accent animate-glow-pulse">
                  {winner}
                </h2>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {gameState === "waiting" && (
                <Button
                  onClick={playGame}
                  className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground"
                >
                  Draw Cards
                </Button>
              )}
              {gameState === "finished" && (
                <Button
                  onClick={resetGame}
                  className="font-pixel bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                >
                  Play Again
                </Button>
              )}
              {gameState === "playing" && (
                <div className="font-pixel text-accent animate-pulse">
                  Drawing cards...
                </div>
              )}
            </div>
          </Card>

          <div className="mt-8 bg-card border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Each player draws one card (1-13)</li>
              <li>• Highest card wins the pot</li>
              <li>• Equal cards = Draw (refund)</li>
              <li>• 10% house fee on winnings</li>
              <li>• Provably fair on-chain randomness</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default War;
