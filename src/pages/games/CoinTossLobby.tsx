import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GameLobby } from "@/components/games/GameLobby";
import { GameHistory } from "@/components/games/GameHistory";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import bk3Image from "@/assets/bk3.png";

const CoinTossLobby = () => {
  const { isConnected } = useWallet();
  const [spectatingMatchId, setSpectatingMatchId] = useState<string | null>(null);

  const handleJoinGame = (matchId: string) => {
    // Navigate to active game or handle in-place
    console.log('Joined game:', matchId);
  };

  const handleSpectateGame = (matchId: string) => {
    setSpectatingMatchId(matchId);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${bk3Image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan" />
        </div>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12 lg:ml-[280px]">
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-2 border-primary p-8 text-center shadow-glow-cyan">
            <Coins className="w-20 h-20 mx-auto mb-4 text-primary animate-glow-pulse" />
            <h2 className="font-pixel text-xl text-primary mb-4">Connect Wallet</h2>
            <p className="font-mono text-sm text-muted-foreground">
              Connect your wallet to start playing
            </p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bk3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan" />
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none" />
      
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] relative">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GameLobby
                gameType="cointoss"
                gameTitle="COINFLIP"
                gameDescription="The classic 50/50 game mode."
                onJoinGame={handleJoinGame}
                onSpectateGame={handleSpectateGame}
              />
            </div>
            <div className="lg:col-span-1">
              <GameHistory gameType="cointoss" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CoinTossLobby;
