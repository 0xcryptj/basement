import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileMenu } from "./ProfileMenu";

type WalletOption = {
  id: string;
  name: string;
  icon: string;
  network: 'solana' | 'base';
  detected?: boolean;
};

export const WalletButton = () => {
  const { isConnected, network, address, walletType, connectWallet, disconnect } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'solana' | 'base'>('solana');

  const solanaWallets: WalletOption[] = [
    { id: 'phantom', name: 'Phantom', icon: '👻', network: 'solana', detected: !!(window as any).phantom?.solana },
    { id: 'solflare', name: 'Solflare', icon: '🔥', network: 'solana' },
    { id: 'slope', name: 'Slope', icon: '📐', network: 'solana' },
    { id: 'glow', name: 'Glow', icon: '✨', network: 'solana' },
    { id: 'backpack', name: 'Backpack', icon: '🎒', network: 'solana' },
  ];

  const ethWallets: WalletOption[] = [
    { id: 'phantom', name: 'Phantom', icon: '👻', network: 'base', detected: !!(window as any).phantom?.ethereum },
    { id: 'metamask', name: 'MetaMask', icon: '🦊', network: 'base', detected: !!(window as any).ethereum?.isMetaMask },
    { id: 'coinbase', name: 'Coinbase', icon: '💎', network: 'base', detected: !!(window as any).ethereum?.isCoinbaseWallet },
    { id: 'torus', name: 'Torus', icon: '🔷', network: 'base' },
    { id: 'ledger', name: 'Ledger', icon: '📱', network: 'base' },
  ];

  const displayedWallets = selectedNetwork === 'solana' ? solanaWallets : ethWallets;
  const detectedWallets = displayedWallets.filter(w => w.detected);
  const popularWallets = displayedWallets.filter(w => !w.detected);

  const handleConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId as any, selectedNetwork);
      toast({ 
        title: "Connected!", 
        description: `${walletId.charAt(0).toUpperCase() + walletId.slice(1)} wallet connected`
      });
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
    return <ProfileMenu />;
  }

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="font-pixel text-xs px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/80"
      >
        <Wallet className="mr-2 h-3 w-3" />
        CONNECT
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[hsl(220,30%,8%)] border border-primary/30 p-0 max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/20">
            <h2 className="font-pixel text-lg text-primary">CONNECT</h2>
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Network Tabs */}
          <div className="flex gap-2 px-4 pt-4">
            <button
              onClick={() => setSelectedNetwork('solana')}
              className={`flex-1 font-pixel text-xs py-2 px-4 rounded transition-all ${
                selectedNetwork === 'solana'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              SOLANA
            </button>
            <button
              onClick={() => setSelectedNetwork('base')}
              className={`flex-1 font-pixel text-xs py-2 px-4 rounded transition-all ${
                selectedNetwork === 'base'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              BASE (ETH)
            </button>
          </div>

          {/* Wallet List */}
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNetwork}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Detected Wallets */}
                {detectedWallets.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-pixel text-[0.6rem] text-muted-foreground">Detected</div>
                    {detectedWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        className="w-full flex items-center gap-3 p-3 bg-background/50 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded transition-all group"
                      >
                        <span className="text-2xl">{wallet.icon}</span>
                        <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                          {wallet.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Wallets */}
                <div className="space-y-2">
                  <div className="font-pixel text-[0.6rem] text-muted-foreground">Popular</div>
                  {popularWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      className="w-full flex items-center gap-3 p-3 bg-background/50 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded transition-all group"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                        {wallet.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
