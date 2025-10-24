import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const savedNetwork = localStorage.getItem('wallet_network') as Network | null;
      const savedAddress = localStorage.getItem('wallet_address');
      
      if (savedNetwork && savedAddress) {
        setNetwork(savedNetwork);
        setAddress(savedAddress);
        setIsConnected(true);
        
        // Fetch or create user in database
        const { data: user } = await supabase
          .from('User')
          .select('id')
          .eq('walletAddress', savedAddress)
          .single();
          
        if (user) {
          setUserId(user.id);
        }
      }
    };
    
    checkSession();
  }, []);

  const connectPhantom = async () => {
    try {
      if (!window.solana) {
        throw new Error('Phantom wallet not found');
      }

      const response = await window.solana.connect();
      const walletAddress = response.publicKey.toString();

      // Create or get user from database
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('walletAddress', walletAddress)
        .single();

      let userIdToSet: string;

      if (existingUser) {
        userIdToSet = existingUser.id;
        
        // Update last seen
        await supabase
          .from('User')
          .update({ lastSeenAt: new Date().toISOString() })
          .eq('id', existingUser.id);
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('User')
          .insert({
            id: crypto.randomUUID(),
            walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`,
          })
          .select('id')
          .single();

        if (error) throw error;
        userIdToSet = newUser.id;
      }

      setNetwork('solana');
      setAddress(walletAddress);
      setUserId(userIdToSet);
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

      // Create or get user from database
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('walletAddress', walletAddress)
        .single();

      let userIdToSet: string;

      if (existingUser) {
        userIdToSet = existingUser.id;
        
        await supabase
          .from('User')
          .update({ lastSeenAt: new Date().toISOString() })
          .eq('id', existingUser.id);
      } else {
        const { data: newUser, error } = await supabase
          .from('User')
          .insert({
            id: crypto.randomUUID(),
            walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`,
          })
          .select('id')
          .single();

        if (error) throw error;
        userIdToSet = newUser.id;
      }

      setNetwork('base');
      setAddress(walletAddress);
      setUserId(userIdToSet);
      setIsConnected(true);
      
      localStorage.setItem('wallet_network', 'base');
      localStorage.setItem('wallet_address', walletAddress);
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
      throw error;
    }
  };

  const disconnect = async () => {
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