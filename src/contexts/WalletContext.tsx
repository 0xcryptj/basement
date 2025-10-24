import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

type Network = 'solana' | 'base';
type WalletType = 'phantom' | 'metamask' | 'coinbase' | 'walletconnect' | 'ledger' | 'slope' | 'solflare' | 'glow' | 'backpack' | 'torus';

interface WalletContextType {
  network: Network | null;
  address: string | null;
  userId: string | null;
  isConnected: boolean;
  walletType: WalletType | null;
  connectWallet: (walletType: WalletType, network: Network) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: { solana?: any };
    coinbaseSolana?: any;
    slope?: any;
    solflare?: any;
    glow?: any;
    backpack?: any;
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

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
      const savedWalletType = localStorage.getItem('wallet_type') as WalletType | null;
      
      if (savedNetwork && savedAddress && savedWalletType) {
        setNetwork(savedNetwork);
        setAddress(savedAddress);
        setWalletType(savedWalletType);
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

  const connectWallet = async (selectedWallet: WalletType, selectedNetwork: Network) => {
    try {
      if (selectedNetwork === 'solana') {
        await connectSolanaWallet(selectedWallet);
      } else {
        await connectEthereumWallet(selectedWallet);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const connectSolanaWallet = async (selectedWallet: WalletType) => {
    let solanaWallet;

    switch (selectedWallet) {
      case 'phantom':
        if (!window.phantom?.solana) {
          throw new Error('Phantom wallet not found. Please install it from phantom.app');
        }
        solanaWallet = window.phantom.solana;
        break;
      case 'solflare':
        if (!window.solflare) {
          throw new Error('Solflare wallet not found. Please install it from solflare.com');
        }
        solanaWallet = window.solflare;
        break;
      case 'slope':
        if (!window.slope) {
          throw new Error('Slope wallet not found. Please install it from slope.finance');
        }
        solanaWallet = window.slope;
        break;
      case 'glow':
        if (!window.glow) {
          throw new Error('Glow wallet not found. Please install it from glow.app');
        }
        solanaWallet = window.glow;
        break;
      case 'backpack':
        if (!window.backpack) {
          throw new Error('Backpack wallet not found. Please install it from backpack.app');
        }
        solanaWallet = window.backpack;
        break;
      default:
        throw new Error('Unsupported Solana wallet');
    }

    const response = await solanaWallet.connect();
    const walletAddress = response.publicKey.toString();

    const uid = await ensureUserExists(walletAddress);

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
    setWalletType(selectedWallet);
    setIsConnected(true);
    
    localStorage.setItem('wallet_network', 'solana');
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('wallet_type', selectedWallet);
  };

  const connectEthereumWallet = async (selectedWallet: WalletType) => {
    let ethereum;

    switch (selectedWallet) {
      case 'metamask':
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          throw new Error('MetaMask not found. Please install it from metamask.io');
        }
        ethereum = window.ethereum;
        break;
      case 'coinbase':
        if (!window.ethereum || !window.ethereum.isCoinbaseWallet) {
          throw new Error('Coinbase Wallet not found. Please install it from coinbase.com/wallet');
        }
        ethereum = window.ethereum;
        break;
      case 'walletconnect':
        throw new Error('WalletConnect support coming soon');
      case 'ledger':
        throw new Error('Ledger support coming soon');
      case 'torus':
        throw new Error('Torus support coming soon');
      default:
        throw new Error('Unsupported Ethereum wallet');
    }

    const provider = new BrowserProvider(ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const walletAddress = accounts[0];

    // Switch to Base network (Chain ID: 8453)
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
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
    setWalletType(selectedWallet);
    setIsConnected(true);
    
    localStorage.setItem('wallet_network', 'base');
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('wallet_type', selectedWallet);
  };

  const disconnect = async () => {
    if (network) {
      await supabase.rpc('update_online_count', {
        network_name: network,
        count_change: -1,
      });
    }
    
    setNetwork(null);
    setAddress(null);
    setUserId(null);
    setWalletType(null);
    setIsConnected(false);
    
    localStorage.removeItem('wallet_network');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_type');
  };

  return (
    <WalletContext.Provider
      value={{
        network,
        address,
        userId,
        isConnected,
        walletType,
        connectWallet,
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
