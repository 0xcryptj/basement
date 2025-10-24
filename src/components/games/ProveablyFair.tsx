import { Shield, Hash, Box } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProvablyFairProps {
  roundId: string;
  serverSeed?: string;
  clientSeed?: string;
  blockHash?: string;
}

export const ProvablyFair = ({ roundId, serverSeed, clientSeed, blockHash }: ProvablyFairProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-background border-2 border-accent/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        <h3 className="font-pixel text-xs text-accent">PROVABLY FAIR</h3>
      </div>

      <div className="space-y-2 font-mono text-[0.6rem]">
        <div className="flex items-start gap-2">
          <Box className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-muted-foreground mb-1">Round ID:</div>
            <div className="text-foreground break-all">{roundId.slice(0, 16)}...</div>
          </div>
        </div>

        {showDetails && (
          <>
            {serverSeed && (
              <div className="flex items-start gap-2">
                <Hash className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-muted-foreground mb-1">Server Seed (Hashed):</div>
                  <div className="text-foreground break-all">{serverSeed}</div>
                </div>
              </div>
            )}

            {clientSeed && (
              <div className="flex items-start gap-2">
                <Hash className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-muted-foreground mb-1">Client Seed:</div>
                  <div className="text-foreground break-all">{clientSeed}</div>
                </div>
              </div>
            )}

            {blockHash && (
              <div className="flex items-start gap-2">
                <Box className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-muted-foreground mb-1">Block Hash:</div>
                  <div className="text-foreground break-all">{blockHash}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full font-pixel text-[0.5rem] bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 py-1"
        size="sm"
      >
        {showDetails ? "HIDE DETAILS" : "SHOW DETAILS"}
      </Button>
    </div>
  );
};