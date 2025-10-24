import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";

const Chess = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-3xl md:text-5xl text-primary mb-4 animate-glow-pulse">
            /CHESS/
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            On-chain strategy game
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-2 border-primary p-8">
            <div className="flex items-center justify-center mb-8">
              <Crown className="w-24 h-24 text-primary animate-glow-pulse" />
            </div>
            
            <div className="text-center">
              <h2 className="font-pixel text-xl text-secondary mb-4">COMING SOON</h2>
              <p className="font-mono text-sm text-muted-foreground max-w-2xl mx-auto">
                Full chess implementation with on-chain move validation, timeout mechanisms, 
                and smart contract escrow. Stay tuned for the strategic showdown!
              </p>
            </div>
          </Card>

          <div className="mt-8 bg-card border-2 border-accent p-6">
            <h3 className="font-pixel text-sm text-accent mb-4">PLANNED FEATURES</h3>
            <ul className="font-mono text-xs text-muted-foreground space-y-2">
              <li>• Standard chess rules with move validation</li>
              <li>• King capture = win condition</li>
              <li>• Timeout protection for inactive players</li>
              <li>• Winner takes 90% of pot</li>
              <li>• 10% house fee on winnings</li>
              <li>• Replay verification system</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Chess;
