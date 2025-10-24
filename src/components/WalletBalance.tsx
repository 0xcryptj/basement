import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import solanaLogo from "@/assets/solana-logo.svg";
import baseLogo from "@/assets/base-logo.svg";

export const WalletBalance = () => {
  const { address, network } = useWallet();
  const [balance, setBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);

  useEffect(() => {
    if (!address) return;

    // Fetch balance from blockchain
    const fetchBalance = async () => {
      try {
        if (network === 'solana') {
          // TODO: Implement Solana balance fetch
          const mockBalance = 1.234;
          setBalance(mockBalance);
          setUsdValue(mockBalance * 192); // Mock SOL price
        } else {
          // TODO: Implement Base/ETH balance fetch
          const mockBalance = 0.456;
          setBalance(mockBalance);
          setUsdValue(mockBalance * 3200); // Mock ETH price
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [address, network]);

  if (!address) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-primary/20 rounded-lg">
      <img 
        src={network === 'solana' ? solanaLogo : baseLogo} 
        alt={network} 
        className="w-4 h-4"
      />
      <div className="flex flex-col">
        <span className="font-mono text-xs text-foreground">
          {balance.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
        </span>
        <span className="font-mono text-[0.6rem] text-muted-foreground">
          ${usdValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
