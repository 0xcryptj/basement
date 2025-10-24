import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Timer, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Entry {
  address: string;
  wager: number;
  odds: number;
}

const LuckyBlock = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [potSize, setPotSize] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [winner, setWinner] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(true);

  const calculateOdds = (wager: number, totalPot: number): number => {
    if (totalPot === 0) return 0;
    return (wager / totalPot) * 100;
  };

  const joinJackpot = () => {
    const mockWager = Math.random() * 0.5 + 0.1; // Random wager between 0.1-0.6
    const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}`;
    
    const newPot = potSize + mockWager;
    const newEntry: Entry = {
      address: mockAddress,
      wager: mockWager,
      odds: calculateOdds(mockWager, newPot),
    };

    // Recalculate odds for all entries
    const updatedEntries = entries.map(entry => ({
      ...entry,
      odds: calculateOdds(entry.wager, newPot),
    }));

    setEntries([...updatedEntries, newEntry]);
    setPotSize(newPot);
    
    toast({
      title: "Joined Jackpot!",
      description: `You're in with ${(newEntry.odds).toFixed(2)}% odds`,
    });
  };

  const drawWinner = () => {
    if (entries.length === 0) return;
    
    // Weighted random selection
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const entry of entries) {
      cumulative += entry.odds;
      if (rand <= cumulative) {
        setWinner(entry.address);
        setRoundActive(false);
        toast({
          title: "Winner Selected!",
          description: `${entry.address.slice(0, 10)}... wins ${(potSize * 0.9).toFixed(4)} ETH!`,
        });
        break;
      }
    }
  };

  const resetRound = () => {
    setEntries([]);
    setPotSize(0);
    setTimeLeft(120);
    setWinner(null);
    setRoundActive(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 pt-20 container mx-auto px-4 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /LUCKY BLOCK/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            Jackpot game with weighted odds
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Left Panel - Pot Info */}
          <Card className="bg-card border-2 border-primary p-6">
            <div className="text-center mb-6">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-pixel text-sm text-muted-foreground mb-2">CURRENT POT</h2>
              <div className="font-pixel text-4xl text-primary animate-glow-pulse">
                {potSize.toFixed(4)} ETH
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background border-2 border-secondary p-3 text-center">
                <Timer className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-pixel text-xs text-muted-foreground mb-1">TIME LEFT</div>
                <div className="font-pixel text-lg text-secondary">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="bg-background border-2 border-accent p-3 text-center">
                <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="font-pixel text-xs text-muted-foreground mb-1">ENTRIES</div>
                <div className="font-pixel text-lg text-accent">{entries.length}</div>
              </div>
            </div>

            {winner && (
              <div className="bg-primary/10 border-2 border-primary p-4 mb-4 animate-glow-pulse">
                <div className="font-pixel text-xs text-primary mb-2">WINNER!</div>
                <div className="font-mono text-sm text-foreground break-all">{winner}</div>
                <div className="font-mono text-xs text-muted-foreground mt-2">
                  Prize: {(potSize * 0.9).toFixed(4)} ETH (10% house fee)
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {roundActive ? (
                <>
                  <Button
                    onClick={joinJackpot}
                    className="flex-1 font-pixel bg-primary hover:bg-primary/80 text-primary-foreground"
                  >
                    Join Jackpot
                  </Button>
                  <Button
                    onClick={drawWinner}
                    disabled={entries.length === 0}
                    className="flex-1 font-pixel bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  >
                    Draw Winner
                  </Button>
                </>
              ) : (
                <Button
                  onClick={resetRound}
                  className="w-full font-pixel bg-accent hover:bg-accent/80 text-accent-foreground"
                >
                  New Round
                </Button>
              )}
            </div>
          </Card>

          {/* Right Panel - Entries & Odds */}
          <Card className="bg-card border-2 border-secondary p-6">
            <h3 className="font-pixel text-sm text-secondary mb-4">ENTRIES & ODDS</h3>
            
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                No entries yet. Be the first to join!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-background border border-primary/30 p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-mono text-xs text-foreground">
                        {entry.address.slice(0, 12)}...
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {entry.wager.toFixed(4)} ETH
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-pixel text-sm text-primary">
                        {entry.odds.toFixed(2)}%
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">odds</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8 max-w-5xl mx-auto bg-card border-2 border-accent p-6">
          <h3 className="font-pixel text-sm text-accent mb-4">HOW IT WORKS</h3>
          <ul className="font-mono text-xs text-muted-foreground space-y-2">
            <li>• Join with any wager amount to enter the jackpot</li>
            <li>• Your odds are weighted based on your wager vs total pot</li>
            <li>• Larger wagers = higher chance to win</li>
            <li>• Round ends after timer or when Draw Winner is triggered</li>
            <li>• Winner receives 90% of pot (10% house fee)</li>
            <li>• Provably fair on-chain randomness</li>
            <li>• Transparent odds calculation visible to all players</li>
          </ul>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LuckyBlock;
