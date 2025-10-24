import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import solanaLogo from "@/assets/solana-logo.svg";
import baseLogo from "@/assets/base-logo.svg";

export const WalletBalance = () => {
  const { address, network } = useWallet();
  const [balance, setBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [address, network]);

  const fetchBalance = async () => {
    if (!address) return;
    setLoading(true);
    
    try {
      if (network === 'solana') {
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const publicKey = new PublicKey(address);
        const lamports = await connection.getBalance(publicKey);
        const sol = lamports / 1e9;
        setBalance(sol);
        
        // Fetch SOL price (you can use a real API here)
        const solPrice = 192; // Mock price
        setUsdValue(sol * solPrice);
      } else {
        // Base network (Ethereum L2)
        const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
        const weiBalance = await provider.getBalance(address);
        const eth = parseFloat(ethers.formatEther(weiBalance));
        setBalance(eth);
        
        // Fetch ETH price (you can use a real API here)
        const ethPrice = 3200; // Mock price
        setUsdValue(eth * ethPrice);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
      setUsdValue(0);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? '...' : balance.toFixed(4)} {network === 'solana' ? 'SOL' : 'ETH'}
        </span>
        <span className="font-mono text-[0.6rem] text-muted-foreground">
          ${loading ? '...' : usdValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
