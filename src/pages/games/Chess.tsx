import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";

const Chess = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="max-w-screen-lg mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="font-pixel text-2xl text-primary mb-4 animate-glow-pulse">
              CHESS
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              On-chain strategy game
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary p-8 text-center mb-8">
            <div className="flex items-center justify-center mb-8">
              <Crown className="w-24 h-24 text-primary animate-glow-pulse" />
            </div>
            
            <h2 className="font-pixel text-xl text-secondary mb-4">COMING SOON</h2>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl mx-auto">
              Full chess implementation with on-chain move validation, timeout mechanisms, 
              and smart contract escrow. Stay tuned for the strategic showdown!
            </p>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">PLANNED FEATURES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Standard chess rules with move validation</li>
              <li>• King capture = win condition</li>
              <li>• Timeout protection for inactive players</li>
              <li>• Winner takes 90% of pot</li>
              <li>• 10% house fee on winnings</li>
              <li>• Replay verification system</li>
            </ul>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chess;
