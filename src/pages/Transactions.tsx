import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Transactions = () => {
  const { userId, network } = useWallet();

  const { data: transactions } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!userId,
  });

  const currency = network === 'solana' ? '◎' : '⟠';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:ml-[280px] transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-pixel text-3xl text-primary mb-8">Transaction History</h1>
          
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <Card key={tx.id} className="bg-card border-2 border-primary/20 p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'win' 
                          ? 'bg-accent/20' 
                          : 'bg-destructive/20'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'win' ? (
                          <ArrowDownLeft className="w-5 h-5 text-accent" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="font-pixel text-sm text-foreground capitalize">
                          {tx.type}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {tx.description || 'No description'}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-pixel text-lg ${
                        tx.type === 'deposit' || tx.type === 'win' 
                          ? 'text-accent' 
                          : 'text-destructive'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}
                        {parseFloat(tx.amount.toString()).toFixed(4)} {currency}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {tx.status}
                      </div>
                      {tx.txHash && (
                        <a 
                          href={network === 'solana' 
                            ? `https://solscan.io/tx/${tx.txHash}`
                            : `https://basescan.org/tx/${tx.txHash}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          View on explorer
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="bg-card border-2 border-primary/20 p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="font-pixel text-sm text-muted-foreground">
                  No transactions yet
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Transactions;
