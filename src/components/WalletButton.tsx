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
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

export const WalletButton = () => {
  const { isConnected, network, address, connectPhantom, connectMetaMask, disconnect } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = async (selectedNetwork: "solana" | "base") => {
    try {
      if (selectedNetwork === "solana") {
        await connectPhantom();
        toast({ title: "Connected!", description: "Phantom wallet connected" });
      } else {
        await connectMetaMask();
        toast({ title: "Connected!", description: "MetaMask wallet connected" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={disconnect}
        className={`font-pixel text-xs px-4 py-2 ${
          network === "solana"
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple"
            : "bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan"
        }`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            onClick={() => handleConnect("base")}
            className="w-full font-pixel text-xs py-6 bg-primary text-primary-foreground hover:bg-primary/80 shadow-glow-cyan transition-all"
          >
            <div className="flex flex-col items-center">
              <span>Base Network (MetaMask)</span>
              <span className="text-[0.6rem] mt-1 opacity-70">Ethereum L2 • ⟠</span>
            </div>
          </Button>
          <Button
            onClick={() => handleConnect("solana")}
            className="w-full font-pixel text-xs py-6 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-glow-purple transition-all"
          >
            <div className="flex flex-col items-center">
              <span>Solana Network (Phantom)</span>
              <span className="text-[0.6rem] mt-1 opacity-70">High Speed Chain • ◎</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
