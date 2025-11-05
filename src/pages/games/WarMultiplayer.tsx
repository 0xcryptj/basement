import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sword, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useGameState } from "@/hooks/useGameState";
import { checkAndProcessBotTurn } from "@/lib/botService";
import { supabase } from "@/integrations/supabase/client";

interface WarGameState {
  player1Card: number | null;
  player2Card: number | null;
  winner: string | null;
  played: boolean;
}

const WarMultiplayer = () => {
  const { toast } = useToast();
  const { isConnected, userId, address } = useWallet();
  const { matchId, opponentId, isSearching, findMatch, cancelSearch, updateGameState, endMatch } = useMatchmaking('war');
  const { gameState, setGameState } = useGameState<WarGameState>(matchId, {
    player1Card: null,
    player2Card: null,
    winner: null,
    played: false,
  });

  const [myCard, setMyCard] = useState<number | null>(null);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);

  useEffect(() => {
    if (!matchId) return;

    // Subscribe to game updates
    const channel = supabase
      .channel(`war-game-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload: { new: { game_state: WarGameState | null; status: string; winner_id: string | null } }) => {
          const updatedState = payload.new.game_state;
          if (updatedState) {
            setGameState(updatedState);
          }
          if (payload.new.status === 'completed') {
            const isPlayer1 = userId !== opponentId;
            const player1Card = updatedState?.player1Card;
            const player2Card = updatedState?.player2Card;
            
            if (player1Card && player2Card) {
              setMyCard(isPlayer1 ? player1Card : player2Card);
              setOpponentCard(isPlayer1 ? player2Card : player1Card);

              setTimeout(() => {
                let winnerId = null;
                if (player1Card > player2Card) {
                  winnerId = isPlayer1 ? userId : opponentId;
                  toast({ title: isPlayer1 ? "Victory!" : "Defeat", description: isPlayer1 ? "You won!" : "Opponent won" });
                } else if (player2Card > player1Card) {
                  winnerId = !isPlayer1 ? userId : opponentId;
                  toast({ title: !isPlayer1 ? "Victory!" : "Defeat", description: !isPlayer1 ? "You won!" : "Opponent won" });
                } else {
                  toast({ title: "Draw", description: "It's a tie!" });
                }
                endMatch(winnerId);
              }, 2000);
            }
          }
        }
      )
      .subscribe();

    // Check if bot needs to play
    if (matchId && gameState && !gameState.played) {
      const botIds = [
        'bot-easy-00000000-0000-0000-0000-000000000000',
        'bot-medium-00000000-0000-0000-0000-000000000000',
        'bot-hard-00000000-0000-0000-0000-000000000000'
      ];
      const isBotOpponent = opponentId && botIds.includes(opponentId);
      
      // If it's a bot game and player hasn't played yet, bot should play automatically
      if (isBotOpponent && !gameState.player1Card && !gameState.player2Card) {
        // Bot will play automatically when player plays
      } else if (isBotOpponent && gameState.player1Card && !gameState.player2Card) {
        // Player played, bot should respond
        setTimeout(() => {
          checkAndProcessBotTurn(matchId);
        }, 1000);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, gameState, userId, opponentId, endMatch, toast, setGameState]);

  const playCard = async () => {
    if (!matchId || !userId) return;

    const card = Math.floor(Math.random() * 13) + 1;
    const isPlayer1 = opponentId ? false : true;

    const newState = {
      ...gameState,
      [isPlayer1 ? 'player1Card' : 'player2Card']: card,
      played: gameState.player1Card !== null || gameState.player2Card !== null,
    };

    await updateGameState(newState);
    setGameState(newState);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-20 container mx-auto px-4 pb-12 flex items-center justify-center">
          <Card className="bg-card border-2 border-primary p-8 text-center">
            <h2 className="font-pixel text-xl text-primary mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground">
              Please connect your wallet to play
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /WAR/ MULTIPLAYER
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Play against real opponents - Highest card wins
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!matchId && !isSearching && (
            <Card className="bg-card border-2 border-primary p-8 text-center">
              <h2 className="font-pixel text-xl text-primary mb-6">Ready to Play?</h2>
              <Button
                onClick={() => findMatch(0)}
                className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                Find Match
              </Button>
            </Card>
          )}

          {isSearching && (
            <Card className="bg-card border-2 border-primary p-8 text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="font-pixel text-xl text-primary mb-4">Searching for opponent...</h2>
              <Button
                onClick={cancelSearch}
                variant="secondary"
                className="font-pixel"
              >
                Cancel
              </Button>
            </Card>
          )}

          {matchId && opponentId && (
            <Card className="bg-card border-2 border-primary p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h3 className="font-pixel text-sm text-primary mb-4">YOUR CARD</h3>
                  <div className="h-48 flex items-center justify-center bg-background border-2 border-primary rounded">
                    {myCard ? (
                      <span className="font-pixel text-6xl text-primary">{myCard}</span>
                    ) : (
                      <Sword className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>

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

              <div className="flex justify-center">
                {!gameState.played && (
                  <Button
                    onClick={playCard}
                    disabled={myCard !== null}
                    className="font-pixel bg-primary hover:bg-primary/80 text-primary-foreground"
                  >
                    {myCard ? "Waiting for opponent..." : "Draw Card"}
                  </Button>
                )}
              </div>
            </Card>
          )}

          <div className="mt-8 bg-card border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">GAME RULES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Find a match and wait for opponent</li>
              <li>• Both players draw one card (1-13)</li>
              <li>• Highest card wins</li>
              <li>• Equal cards = Draw</li>
              <li>• Real-time multiplayer sync</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WarMultiplayer;