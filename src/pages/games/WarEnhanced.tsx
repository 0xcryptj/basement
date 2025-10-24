import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlayingCard } from "@/components/PlayingCard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useSound } from "@/hooks/useSound";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useGameState } from "@/hooks/useGameState";
import { supabase } from "@/integrations/supabase/client";

interface WarGameState {
  player1Card: number | null;
  player2Card: number | null;
  player1Suit: string | null;
  player2Suit: string | null;
  winner: string | null;
  played: boolean;
}

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

const WarEnhanced = () => {
  const { toast } = useToast();
  const { isConnected, userId, network } = useWallet();
  const { play } = useSound();
  const { matchId, opponentId, isSearching, findMatch, cancelSearch, updateGameState, endMatch } = useMatchmaking('war');
  const { gameState, setGameState } = useGameState<WarGameState>(matchId, {
    player1Card: null,
    player2Card: null,
    player1Suit: null,
    player2Suit: null,
    winner: null,
    played: false,
  });
  
  const [wagerAmount, setWagerAmount] = useState(0.01);
  const [myCard, setMyCard] = useState<{ rank: number; suit: string } | null>(null);
  const [opponentCard, setOpponentCard] = useState<{ rank: number; suit: string } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const drawCard = async () => {
    if (!matchId || !userId) return;

    const card = Math.floor(Math.random() * 13) + 1;
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const isPlayer1 = !opponentId;

    play('click');

    const newState = {
      ...gameState,
      [isPlayer1 ? 'player1Card' : 'player2Card']: card,
      [isPlayer1 ? 'player1Suit' : 'player2Suit']: suit,
      played: (isPlayer1 && gameState.player2Card !== null) || (!isPlayer1 && gameState.player1Card !== null),
    };

    await updateGameState(newState);
    setGameState(newState);
    setMyCard({ rank: card, suit });

    // Check if both players have drawn
    if (newState.played) {
      setTimeout(() => {
        revealWinner(newState);
      }, 1500);
    }
  };

  const revealWinner = async (state: WarGameState) => {
    const p1Card = state.player1Card!;
    const p2Card = state.player2Card!;

    setRevealed(true);
    setOpponentCard({
      rank: opponentId ? p2Card : p1Card,
      suit: (opponentId ? state.player2Suit : state.player1Suit) || 'spades',
    });

    const isPlayer1 = !opponentId;
    const myCardValue = isPlayer1 ? p1Card : p2Card;
    const theirCardValue = isPlayer1 ? p2Card : p1Card;

    // Increment wager stats
    await supabase.rpc('increment_wager_stats', {
      wager_amt: wagerAmount,
    });

    setTimeout(async () => {
      let winnerId = null;
      
      if (myCardValue > theirCardValue) {
        winnerId = userId;
        play('win');
        toast({
          title: "🎉 Victory! 🎉",
          description: `You won ${(wagerAmount * 1.9).toFixed(4)} ${network === 'solana' ? 'SOL' : 'ETH'}!`,
        });
      } else if (theirCardValue > myCardValue) {
        winnerId = opponentId;
        play('lose');
        toast({
          title: "Defeat",
          description: "Better luck next time!",
          variant: "destructive",
        });
      } else {
        play('click');
        toast({
          title: "Draw",
          description: "It's a tie - wagers refunded",
        });
      }

      await endMatch(winnerId);
      
      setTimeout(() => {
        setMyCard(null);
        setOpponentCard(null);
        setRevealed(false);
      }, 3000);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 pb-12 flex items-center justify-center min-h-[60vh] lg:ml-[280px] transition-all duration-300">
          <Card className="bg-card border-2 border-primary p-8 text-center animate-scale-in">
            <h2 className="font-pixel text-xl text-primary mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground">
              Connect your wallet to play War
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
      
      <div className="pt-20 container mx-auto px-4 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-pixel text-2xl text-primary mb-4 animate-glow-pulse">
            WAR {network === 'solana' ? '◎' : '⟠'}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Classic card battle • Highest card wins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!matchId && !isSearching && (
            <Card className="bg-card border-2 border-primary p-8 text-center animate-scale-in">
              <h2 className="font-pixel text-xl text-primary mb-6">Ready for Battle?</h2>
              
              <div className="mb-6">
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">
                  WAGER AMOUNT
                </label>
                <div className="flex gap-2 justify-center max-w-xs mx-auto">
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

              <Button
                onClick={() => findMatch(wagerAmount)}
                className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground hover-scale"
              >
                Find Match
              </Button>
            </Card>
          )}

          {isSearching && (
            <Card className="bg-card border-2 border-primary p-8 text-center animate-scale-in">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="font-pixel text-xl text-primary mb-4">Searching for opponent...</h2>
              <Button
                onClick={cancelSearch}
                variant="secondary"
                className="font-pixel hover-scale"
              >
                Cancel
              </Button>
            </Card>
          )}

          {matchId && opponentId && (
            <div className="space-y-6">
              <Card className="bg-card border-2 border-primary p-8 animate-scale-in">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Your Card */}
                  <div className="text-center">
                    <h3 className="font-pixel text-sm text-primary mb-4">YOUR CARD</h3>
                    <div className="flex justify-center">
                      {myCard ? (
                        <PlayingCard
                          rank={myCard.rank}
                          suit={myCard.suit as any}
                          isRevealed={true}
                        />
                      ) : (
                        <PlayingCard
                          rank={0}
                          isRevealed={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* Opponent's Card */}
                  <div className="text-center">
                    <h3 className="font-pixel text-sm text-secondary mb-4">OPPONENT'S CARD</h3>
                    <div className="flex justify-center">
                      {opponentCard && revealed ? (
                        <PlayingCard
                          rank={opponentCard.rank}
                          suit={opponentCard.suit as any}
                          isRevealed={true}
                        />
                      ) : (
                        <PlayingCard
                          rank={0}
                          isRevealed={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  {!gameState.played && !myCard && (
                    <Button
                      onClick={drawCard}
                      className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground hover-scale"
                    >
                      Draw Card
                    </Button>
                  )}
                  {myCard && !gameState.played && (
                    <div className="font-pixel text-accent animate-pulse">
                      Waiting for opponent...
                    </div>
                  )}
                  {gameState.played && !revealed && (
                    <div className="font-pixel text-accent animate-pulse">
                      Revealing cards...
                    </div>
                  )}
                </div>
              </Card>

              <Card className="bg-card border-2 border-accent p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
                <ul className="font-mono text-xs text-muted-foreground space-y-2">
                  <li>• Match with another player</li>
                  <li>• Both players draw a card (Ace = 1, Jack = 11, Queen = 12, King = 13)</li>
                  <li>• Highest card wins 90% of total pot (10% house fee)</li>
                  <li>• Equal cards = Draw (wagers refunded)</li>
                  <li>• Provably fair on-chain results</li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WarEnhanced;