import { useState, ReactNode } from "react";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { ProfileMenu } from "./ProfileMenu";
import phantomIcon from "@/assets/Phantom.svg";
import metamaskIcon from "@/assets/metamask.svg";
import baseIcon from "@/assets/base.svg";

type WalletOption = {
  id: string;
  name: string;
  icon: ReactNode;
  network: 'base';
  detected?: boolean;
};

interface WindowWithEthereum {
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    [key: string]: unknown;
  };
  phantom?: {
    ethereum?: unknown;
  };
}

export const WalletButton = () => {
  const { isConnected, network, address, walletType, connectWallet, disconnect } = useWallet();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedNetwork = 'base' as const; // Only Base supported

  const windowWithEth = window as unknown as WindowWithEthereum;
  
  const ethWallets: WalletOption[] = [
    { id: 'metamask', name: 'MetaMask', icon: <img src={metamaskIcon} alt="MetaMask" className="w-6 h-6" />, network: 'base', detected: !!windowWithEth.ethereum?.isMetaMask },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <img src={baseIcon} alt="Coinbase Wallet" className="w-6 h-6" />, network: 'base', detected: !!windowWithEth.ethereum?.isCoinbaseWallet },
    { id: 'phantom', name: 'Phantom', icon: <img src={phantomIcon} alt="Phantom" className="w-6 h-6 rounded-md" />, network: 'base', detected: !!windowWithEth.phantom?.ethereum },
  ];

  const displayedWallets = ethWallets;
  const detectedWallets = displayedWallets.filter(w => w.detected);
  const popularWallets = displayedWallets.filter(w => !w.detected);

  const handleConnect = async (walletId: string) => {
    try {
      console.log('🔄 Initiating wallet connection...');
      await connectWallet(walletId as 'metamask' | 'coinbase' | 'phantom', selectedNetwork);
      console.log('✅ Connection successful in UI');
      toast({ 
        title: "Connected!", 
        description: `${walletId.charAt(0).toUpperCase() + walletId.slice(1)} wallet connected`
      });
      setIsDialogOpen(false);
    } catch (error: unknown) {
      console.error('❌ Connection failed in UI:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      toast({
        title: "Connection Failed",
        description: errorMessage,
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
        <DialogContent className="bg-[hsl(220,30%,8%)] border border-primary/30 p-0 max-w-md w-[95vw] sm:w-full [&>button]:hidden">
          <DialogTitle className="sr-only">Connect Wallet</DialogTitle>
          <DialogDescription className="sr-only">Choose a wallet to connect to The Basement</DialogDescription>
          {/* Header with custom close button */}
          <div className="flex items-center justify-between p-4 border-b border-primary/20">
            <h2 className="font-pixel text-lg text-primary">CONNECT</h2>
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="text-muted-foreground hover:text-primary transition-colors touch-target-lg"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Network Header */}
          <div className="px-4 pt-4">
            <div className="bg-primary/10 border border-primary/30 rounded px-3 py-2">
              <span className="font-pixel text-xs text-primary">BASE (ETH)</span>
            </div>
          </div>

          {/* Wallet List */}
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
                {/* Detected Wallets */}
                {detectedWallets.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-pixel text-[0.6rem] text-muted-foreground">Detected</div>
                    {detectedWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        className="w-full flex items-center gap-3 p-3 sm:p-4 bg-background/50 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded transition-all group touch-target-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8">{wallet.icon}</div>
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
                      className="w-full flex items-center gap-3 p-3 sm:p-4 bg-background/50 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded transition-all group touch-target-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8">{wallet.icon}</div>
                      <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                        {wallet.name}
                      </span>
                    </button>
                  ))}
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
