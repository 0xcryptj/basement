import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Network = "solana" | "base" | null;

export const WalletButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<Network>(null);
  const [address, setAddress] = useState("");

  const connectWallet = async (selectedNetwork: Network) => {
    // Mock connection - replace with actual wallet logic
    if (selectedNetwork === "solana") {
      setAddress("bLTgi8...oyYf");
    } else {
      setAddress("0x0F03...5B03");
    }
    setNetwork(selectedNetwork);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setNetwork(null);
    setAddress("");
  };

  if (isConnected) {
    return (
      <Button
        onClick={disconnectWallet}
        className={`font-pixel text-xs px-4 py-2 ${
          network === "solana"
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple"
            : "bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan"
        }`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {address}
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-pixel text-xs px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan transition-all">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary">Select Network</DialogTitle>
          <DialogDescription className="font-mono text-muted-foreground">
            Choose your preferred blockchain network
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <Button
            onClick={() => connectWallet("base")}
            className="w-full font-pixel text-xs py-6 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan transition-all"
          >
            <div className="flex flex-col items-center">
              <span>Base Network</span>
              <span className="text-[0.6rem] mt-1 opacity-70">Ethereum L2</span>
            </div>
          </Button>
          <Button
            onClick={() => connectWallet("solana")}
            className="w-full font-pixel text-xs py-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple transition-all"
          >
            <div className="flex flex-col items-center">
              <span>Solana Network</span>
              <span className="text-[0.6rem] mt-1 opacity-70">High Speed Chain</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
