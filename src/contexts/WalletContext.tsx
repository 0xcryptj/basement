import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

type Network = 'solana' | 'base';

interface WalletContextType {
  network: Network | null;
  address: string | null;
  userId: string | null;
  isConnected: boolean;
  connectPhantom: () => Promise<void>;
  connectMetaMask: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const ensureUserExists = async (walletAddress: string) => {
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('walletAddress', walletAddress)
      .single();

    if (!existingUser) {
      const { data: newUser, error } = await supabase
        .from('User')
        .insert([{
          id: crypto.randomUUID(),
          walletAddress: walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      return newUser.id;
    }

    return existingUser.id;
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const savedNetwork = localStorage.getItem('wallet_network') as Network | null;
      const savedAddress = localStorage.getItem('wallet_address');
      
      if (savedNetwork && savedAddress) {
        setNetwork(savedNetwork);
        setAddress(savedAddress);
        setIsConnected(true);
        
        try {
          const uid = await ensureUserExists(savedAddress);
          setUserId(uid);
          
          // Update online count
          await supabase.rpc('update_online_count', {
            network_name: savedNetwork,
            count_change: 1,
          });
        } catch (error) {
          console.error('Error restoring session:', error);
        }
      }
    };
    
    checkSession();

    // Cleanup on unmount
    return () => {
      const savedNetwork = localStorage.getItem('wallet_network');
      if (savedNetwork && isConnected) {
        supabase.rpc('update_online_count', {
          network_name: savedNetwork,
          count_change: -1,
        });
      }
    };
  }, []);

  const connectPhantom = async () => {
    try {
      if (!window.solana) {
        throw new Error('Phantom wallet not found');
      }

      const response = await window.solana.connect();
      const walletAddress = response.publicKey.toString();

      const uid = await ensureUserExists(walletAddress);

      // Update last seen and online count
      await supabase
        .from('User')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', uid);
      
      await supabase.rpc('update_online_count', {
        network_name: 'solana',
        count_change: 1,
      });

      setNetwork('solana');
      setAddress(walletAddress);
      setUserId(uid);
      setIsConnected(true);
      
      localStorage.setItem('wallet_network', 'solana');
      localStorage.setItem('wallet_address', walletAddress);
    } catch (error) {
      console.error('Error connecting Phantom:', error);
      throw error;
    }
  };

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];

      // Switch to Base network (Chain ID: 8453)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 in hex
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        }
      }

      const uid = await ensureUserExists(walletAddress);

      await supabase
        .from('User')
        .update({ lastSeenAt: new Date().toISOString() })
        .eq('id', uid);
      
      await supabase.rpc('update_online_count', {
        network_name: 'base',
        count_change: 1,
      });

      setNetwork('base');
      setAddress(walletAddress);
      setUserId(uid);
      setIsConnected(true);
      
      localStorage.setItem('wallet_network', 'base');
      localStorage.setItem('wallet_address', walletAddress);
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    // Update online count before disconnecting
    if (network) {
      await supabase.rpc('update_online_count', {
        network_name: network,
        count_change: -1,
      });
    }
    
    setNetwork(null);
    setAddress(null);
    setUserId(null);
    setIsConnected(false);
    
    localStorage.removeItem('wallet_network');
    localStorage.removeItem('wallet_address');
  };

  return (
    <WalletContext.Provider
      value={{
        network,
        address,
        userId,
        isConnected,
        connectPhantom,
        connectMetaMask,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
