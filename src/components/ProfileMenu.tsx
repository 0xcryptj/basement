import { Menu, TrendingUp, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const ProfileMenu = () => {
  const { userId, address, network, disconnect } = useWallet();

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-primary/10"
        >
          <Avatar className={`w-12 h-12 rounded-lg border-2 ${
            network === 'solana' 
              ? 'border-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.3)]' 
              : 'border-[#0052FF] shadow-[0_0_10px_rgba(0,82,255,0.3)]'
          }`}>
            <AvatarImage src={userData?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-pixel text-sm rounded-lg">
              {userData?.username?.[0]?.toUpperCase() || address?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-[hsl(220,30%,10%)] border-primary/20">
        <div className="px-2 py-2">
          <p className="font-pixel text-xs text-primary">
            {userData?.username || `User ${address?.slice(0, 8)}`}
          </p>
          <p className="font-mono text-[0.6rem] text-muted-foreground truncate">
            {address}
          </p>
        </div>
        
        <DropdownMenuSeparator className="bg-primary/20" />
        
        <DropdownMenuItem
          onClick={() => window.location.href = '/account'}
          className="font-mono text-xs cursor-pointer hover:bg-primary/10"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          Account
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => window.location.href = '/statistics'}
          className="font-mono text-xs cursor-pointer hover:bg-primary/10"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Statistics
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => window.location.href = '/transactions'}
          className="font-mono text-xs cursor-pointer hover:bg-primary/10"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Transactions
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-primary/20" />
        
        <DropdownMenuItem
          onClick={disconnect}
          className="font-mono text-xs cursor-pointer hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
