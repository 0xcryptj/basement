import { useState } from "react";
import { TrendingUp, Trophy, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Statistics = () => {
  const { userId, network } = useWallet();
  const [timeframe, setTimeframe] = useState("7");

  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  // Mock chart data - in production, fetch based on timeframe
  const chartData = [
    { date: '2024-01', profit: 0.5 },
    { date: '2024-02', profit: -0.3 },
    { date: '2024-03', profit: 1.2 },
    { date: '2024-04', profit: 0.8 },
    { date: '2024-05', profit: -0.5 },
    { date: '2024-06', profit: 2.1 },
  ];

  const currency = network === 'solana' ? '◎' : '⟠';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-pixel text-3xl text-primary">Statistics</h1>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] font-mono">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {/* Net Profit Card */}
            <Card className="bg-card border-2 border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="font-pixel text-xl text-primary">Net Profit/Loss</h2>
              </div>
              <div className={`font-pixel text-4xl mb-4 ${
                (userData?.netProfit || 0) >= 0 ? 'text-accent' : 'text-destructive'
              }`}>
                {(userData?.netProfit || 0) >= 0 ? '+' : ''}{(userData?.netProfit || 0).toFixed(3)} {currency}
              </div>
              
              {/* Simple Chart Visualization */}
              <div className="mt-6 h-48 flex items-end gap-2">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full ${item.profit >= 0 ? 'bg-accent' : 'bg-destructive'} rounded-t transition-all`}
                      style={{ 
                        height: `${Math.abs(item.profit) * 50}px`,
                        minHeight: '4px'
                      }}
                    />
                    <span className="font-mono text-xs text-muted-foreground mt-2">
                      {item.date.split('-')[1]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Wager Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-2 border-primary/20 p-4">
                <div className="font-mono text-xs text-muted-foreground mb-2">Total Wagered</div>
                <div className="font-pixel text-2xl text-foreground">
                  {(userData?.totalWagered || 0).toFixed(3)} {currency}
                </div>
              </Card>

              <Card className="bg-card border-2 border-accent/20 p-4">
                <div className="font-mono text-xs text-muted-foreground mb-2">Total Won</div>
                <div className="font-pixel text-2xl text-accent">
                  {(userData?.totalWon || 0).toFixed(3)} {currency}
                </div>
              </Card>

              <Card className="bg-card border-2 border-destructive/20 p-4">
                <div className="font-mono text-xs text-muted-foreground mb-2">Total Lost</div>
                <div className="font-pixel text-2xl text-destructive">
                  {(userData?.totalLost || 0).toFixed(3)} {currency}
                </div>
              </Card>

              <Card className="bg-card border-2 border-secondary/20 p-4">
                <div className="font-mono text-xs text-muted-foreground mb-2">Win Rate</div>
                <div className="font-pixel text-2xl text-secondary">
                  {(userData?.winRate || 0).toFixed(1)}%
                </div>
              </Card>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-2 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-pixel text-sm text-primary">Biggest Win</h3>
                </div>
                <div className="font-pixel text-3xl text-accent">
                  +2.450 {currency}
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Chess Match • 3 days ago
                </p>
              </Card>

              <Card className="bg-card border-2 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-pixel text-sm text-primary">Luckiest Win</h3>
                </div>
                <div className="font-pixel text-3xl text-accent">
                  +5.200 {currency}
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Jackpot • 12% chance • Last week
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Statistics;
