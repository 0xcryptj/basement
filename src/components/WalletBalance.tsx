import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { ethers } from "ethers";
import baseLogo from "@/assets/base-logo.svg";
import { ethToUsd } from "@/lib/currency";

export const WalletBalance = () => {
  const { address } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [address]);

  const fetchBalance = async () => {
    if (!address) return;
    setLoading(true);
    
    try {
      // Base network (Ethereum L2) only
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const weiBalance = await provider.getBalance(address);
      const eth = parseFloat(ethers.formatEther(weiBalance));
      setBalance(eth);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 border border-primary/20 rounded-lg">
      <img 
        src={baseLogo} 
        alt="Base" 
        className="w-4 h-4"
      />
      <div className="flex flex-col">
        <span className="font-mono text-xs text-foreground">
          {loading ? '...' : balance.toFixed(4)} ETH
        </span>
        <span className="font-mono text-[0.6rem] text-muted-foreground">
          ${loading ? '...' : ethToUsd(balance).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
