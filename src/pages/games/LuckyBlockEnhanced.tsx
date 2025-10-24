import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalStats } from "@/components/GlobalStats";
import { Sparkles, Timer, Trophy, Loader2, Users, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import bk3Image from "@/assets/bk3.png";

const LuckyBlockEnhanced = () => {
  const { toast } = useToast();
  const { isConnected, address } = useWallet();
  const [wagerAmount, setWagerAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(24);
  const [isJoining, setIsJoining] = useState(false);
  const [userBalance] = useState(0.00095);
  const [jackpotValue] = useState(0.019);
  const [yourChance] = useState(0.00);

  // Mock players data
  const mockPlayers = [
    { id: 1, username: 'Harly', wager: 0.010, chance: 51.60, avatar: null },
  ];

  const placeBet = async () => {
    if (!isConnected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to place a bet',
        variant: 'destructive',
      });
      return;
    }

    if (wagerAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid wager amount',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    // Simulate bet placement
    setTimeout(() => {
      toast({
        title: 'Bet Placed!',
        description: `Successfully placed bet of ${wagerAmount} SOL`,
      });
      setIsJoining(false);
    }, 1500);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220,45%,6%)] relative overflow-x-hidden">
      {/* Hero Background - More Visible */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bk3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Subtle Matrix Rain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan" />
      </div>
      
      {/* Dark overlay for contrast */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none" />
      
      <Navbar />
      <GlobalStats />
      
      <div className="relative pt-20 pb-12 ml-0 lg:ml-[280px] transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-glow-pulse" />
                <h1 className="font-pixel text-xl sm:text-2xl text-primary">JACKPOT</h1>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                Winner takes all...
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <Button className="w-full sm:w-auto font-pixel text-[0.65rem] sm:text-xs bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 px-3 py-2 whitespace-nowrap">
                $25K WEEKLY LEADERBOARD
              </Button>
              <div className="flex items-center gap-2 bg-background/50 border border-primary/30 rounded-lg px-3 sm:px-4 py-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-mono text-xs sm:text-sm text-primary">{userBalance.toFixed(8)}</span>
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="grid lg:grid-cols-[1fr,300px] xl:grid-cols-[1fr,320px] gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Bet Controls */}
              <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4 sm:p-6 overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <p className="font-mono text-xs text-muted-foreground mb-2">Bet Amount ~$0</p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center gap-2 bg-background/50 border border-primary/20 rounded px-3 py-2 flex-1">
                        <span className="font-mono text-sm">≡</span>
                        <input
                          type="number"
                          value={wagerAmount}
                          onChange={(e) => setWagerAmount(parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent font-mono text-base sm:text-lg text-foreground outline-none"
                          placeholder="0"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-background whitespace-nowrap"
                      >
                        SOL <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setWagerAmount(prev => prev + 0.1)}
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-primary/10"
                      >
                        +0.1
                      </Button>
                      <Button
                        onClick={() => setWagerAmount(prev => prev + 1)}
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs bg-background/50 border-primary/20 hover:bg-primary/10"
                      >
                        +1
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Balance:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">≡</span>
                        <span className="font-mono text-xs sm:text-sm text-foreground">{userBalance.toFixed(8)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={placeBet}
                    disabled={!isConnected || isJoining || wagerAmount <= 0}
                    className="font-pixel text-sm px-6 sm:px-8 py-5 sm:py-6 bg-purple-600 hover:bg-purple-700 text-white w-full shadow-glow-purple transition-all duration-200 hover:scale-105"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      'Place Bet'
                    )}
                  </Button>
                </div>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border-2 border-primary/30 p-3 sm:p-4 shadow-glow-cyan">
                  <p className="font-mono text-[0.65rem] sm:text-xs text-muted-foreground mb-2">Jackpot Value</p>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">≡</span>
                    <span className="font-pixel text-lg sm:text-xl text-primary animate-glow-pulse">
                      {jackpotValue.toFixed(3)}
                    </span>
                  </div>
                </Card>

                <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-3 sm:p-4">
                  <p className="font-mono text-[0.65rem] sm:text-xs text-muted-foreground mb-2">Your Wager</p>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">≡</span>
                    <span className="font-pixel text-lg sm:text-xl text-foreground">
                      {wagerAmount.toFixed(3)}
                    </span>
                  </div>
                </Card>

                <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-3 sm:p-4">
                  <p className="font-mono text-[0.65rem] sm:text-xs text-muted-foreground mb-2">Your Chance</p>
                  <span className="font-pixel text-lg sm:text-xl text-foreground">{yourChance.toFixed(2)}%</span>
                </Card>

                <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-3 sm:p-4">
                  <p className="font-mono text-[0.65rem] sm:text-xs text-muted-foreground mb-2">Time Left</p>
                  <span className="font-pixel text-lg sm:text-xl text-foreground">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </Card>
              </div>

              {/* Player Slots */}
              <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-primary" />
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                  {[...Array(6)].map((_, idx) => {
                    const player = mockPlayers[idx];
                    return (
                      <div
                        key={idx}
                        className="aspect-square bg-background/50 border border-primary/20 rounded-lg flex flex-col items-center justify-center relative p-2"
                      >
                        {player ? (
                          <>
                            <Avatar className="w-12 h-12 mb-2">
                              <AvatarImage src={player.avatar || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xs">
                                {player.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute top-2 right-2 bg-background rounded px-1">
                              <span className="font-mono text-[0.5rem] text-muted-foreground">21</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[0.5rem]">≡</span>
                              <span className="font-mono text-xs text-foreground">
                                {player.wager.toFixed(3)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-background/50 border border-primary/10 flex items-center justify-center mb-2">
                              <span className="text-2xl text-muted-foreground/30">?</span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">Waiting</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[0.5rem]">≡</span>
                              <span className="font-mono text-xs text-muted-foreground">0.000</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Info */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-primary/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm text-foreground">{mockPlayers.length} Players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      ≡ Payouts are settled in SOL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">#</span>
                    <span className="font-mono text-xs text-muted-foreground">Round: 167268</span>
                  </div>
                </div>
              </Card>

              {/* Players List */}
              {mockPlayers.length > 0 && (
                <Card className="bg-[hsl(220,30%,10%)] border border-primary/20 p-4">
                  <div className="space-y-2">
                    {mockPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-background/30 border border-primary/10 rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-primary/30">
                            <AvatarImage src={player.avatar || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary font-pixel text-xs">
                              {player.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-mono text-sm text-foreground flex items-center gap-2">
                              {player.username}
                              <span className="text-xs text-purple-400 bg-purple-600/20 px-1.5 rounded">21</span>
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs">≡</span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {player.wager.toFixed(3)}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">~$1.92</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-mono text-xs text-muted-foreground">Chance</p>
                          <p className="font-pixel text-lg text-primary">{player.chance.toFixed(2)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 min-w-0">
              <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="font-pixel text-[0.65rem] sm:text-xs text-muted-foreground">ROUND</span>
                  <span className="font-mono text-xs text-primary">#167268</span>
                </div>
                
                <div className="aspect-square bg-background/30 border border-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                  <img 
                    src={bk3Image} 
                    alt="Round" 
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">Won</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">≡</span>
                      <span className="font-mono text-sm text-primary">0.386</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">Chance</span>
                    <span className="font-mono text-sm text-primary">32.23%</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-primary/20 p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="font-pixel text-[0.65rem] sm:text-xs text-accent">LAST WINNER</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-accent/30">
                    <AvatarFallback className="bg-accent/20 text-accent font-pixel text-xs">
                      B
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-foreground flex items-center gap-2">
                      <span className="truncate">BOZO</span>
                      <span className="text-xs text-accent bg-accent/20 px-1.5 rounded shrink-0">56</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">≡</span>
                      <span className="font-mono text-xs text-muted-foreground">0.386</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Chance</span>
                    <span className="font-mono text-accent">32.23%</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-[hsl(220,30%,10%)]/80 backdrop-blur-sm border border-accent/20 p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-pixel text-[0.65rem] sm:text-xs text-accent">LUCK OF THE DAY</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-accent/30">
                    <AvatarFallback className="bg-accent/20 text-accent font-pixel text-xs">
                      C
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-foreground flex items-center gap-2">
                      <span className="truncate">Crashout</span>
                      <span className="text-xs text-accent bg-accent/20 px-1.5 rounded shrink-0">4</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs">≡</span>
                      <span className="font-mono text-xs text-accent">1.405</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-accent/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Chance</span>
                    <span className="font-mono text-accent">0.15%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LuckyBlockEnhanced;
