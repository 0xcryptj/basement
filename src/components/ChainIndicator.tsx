import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Badge } from "@/components/ui/badge";

export const ChainIndicator = () => {
  const { network, address } = useWallet();
  const [basename, setBasename] = useState<string | null>(null);

  useEffect(() => {
    if (network === "base" && address) {
      fetchBasename(address);
    } else {
      setBasename(null);
    }
  }, [network, address]);

  const fetchBasename = async (address: string) => {
    try {
      // Call Basename API to resolve address to basename
      const response = await fetch(
        `https://resolver-api.basename.app/v1/address/${address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.basename) {
          setBasename(data.basename);
        }
      }
    } catch (error) {
      console.error("Error fetching basename:", error);
    }
  };

  if (!network) return null;

  return (
    <div className="fixed top-20 right-6 z-40 flex flex-col gap-2">
      <Badge
        variant="outline"
        className={`font-pixel text-[0.6rem] px-3 py-1 ${
          network === "solana"
            ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-glow-purple"
            : "bg-blue-500/20 border-blue-500 text-blue-400 shadow-glow-cyan"
        }`}
      >
        {network === "solana" ? "SOLANA" : "BASE"}
      </Badge>
      
      {basename && (
        <Badge
          variant="outline"
          className="font-mono text-[0.5rem] px-2 py-1 bg-accent/20 border-accent text-accent shadow-glow-purple"
        >
          {basename}
        </Badge>
      )}
    </div>
  );
};