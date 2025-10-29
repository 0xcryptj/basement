import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { verifySignature, generateAuthMessage } from '@/lib/walletAuth';

type Network = 'base'; // 'solana' temporarily disabled
type WalletType = 'metamask' | 'coinbase' | 'phantom'; // Only ETH wallets enabled

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

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  send: (method: string, params?: unknown[]) => Promise<unknown>;
}

interface SolanaProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    solana?: SolanaProvider;
    phantom?: { 
      solana?: SolanaProvider;
      ethereum?: EthereumProvider;
    };
    coinbaseSolana?: SolanaProvider;
    slope?: SolanaProvider;
    solflare?: SolanaProvider;
    glow?: SolanaProvider;
    backpack?: SolanaProvider;
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const restoredNetworkRef = useRef<Network | null>(null);
  const hasRestoredRef = useRef<boolean>(false);

  const ensureUserExists = async (walletAddress: string): Promise<string> => {
    try {
      // Use maybeSingle() to avoid throwing error when no user exists
      const { data: existingUser, error: queryError } = await supabase
        .from('User')
        .select('id')
        .eq('walletAddress', walletAddress)
        .maybeSingle();

      if (queryError) {
        console.error('Error querying user:', queryError);
        throw queryError;
      }

      if (existingUser?.id) {
        return existingUser.id;
      }

      // User doesn't exist, create new one
      const { data: newUser, error: insertError } = await supabase
        .from('User')
        .insert([{
          id: crypto.randomUUID(),
          walletAddress: walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
        }])
        .select('id')
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        throw insertError || new Error('Failed to create user');
      }

      return newUser.id;
    } catch (error) {
      console.error('ensureUserExists error:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let wasRestored = false;

    // Check for existing session - only run once on mount
    const checkSession = async () => {
      // Prevent multiple calls
      if (hasRestoredRef.current) return;
      
      const savedNetwork = localStorage.getItem('wallet_network') as Network | null;
      const savedAddress = localStorage.getItem('wallet_address');
      const savedWalletType = localStorage.getItem('wallet_type') as WalletType | null;
      const savedSignature = localStorage.getItem('wallet_signature');
      
      if (!savedNetwork || !savedAddress || !savedWalletType || !savedSignature) {
        return; // No complete saved session
      }

      // Mark as attempting restore immediately to prevent recursion
      hasRestoredRef.current = true;
      
      try {
        console.log('🔄 Restoring wallet session...');
        
        // First verify Supabase connection
        const { data: testData, error: testError } = await supabase
          .from('User')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('Supabase connection error:', testError);
          hasRestoredRef.current = false;
          return;
        }

        // Ensure user exists
        const uid = await ensureUserExists(savedAddress);
        
        if (!isMounted) return;

        // Batch all state updates together to prevent multiple re-renders
        wasRestored = true;
        restoredNetworkRef.current = savedNetwork;
        
        // Update all state at once
        setNetwork(savedNetwork);
        setAddress(savedAddress);
        setUserId(uid);
        setWalletType(savedWalletType);
        setIsConnected(true);
        
        console.log('✅ Wallet session restored!');
        
        // Update online count (non-blocking)
        supabase.rpc('update_online_count', {
          network_name: savedNetwork,
          count_change: 1,
        }).then(({ error }) => {
          if (error) console.error('Error updating online count:', error);
        });
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear localStorage if restore failed
        localStorage.removeItem('wallet_network');
        localStorage.removeItem('wallet_address');
        localStorage.removeItem('wallet_type');
        localStorage.removeItem('wallet_signature');
        localStorage.removeItem('wallet_signed_message');
        hasRestoredRef.current = false;
        restoredNetworkRef.current = null;
        wasRestored = false;
      }
    };
    
    checkSession();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      // Only decrement if we successfully restored a session
      if (wasRestored && restoredNetworkRef.current) {
        const networkToCleanup = restoredNetworkRef.current;
        restoredNetworkRef.current = null;
        supabase.rpc('update_online_count', {
          network_name: networkToCleanup,
          count_change: -1,
        }).then(({ error }) => {
          if (error) console.error('Error updating online count on unmount:', error);
        });
      }
    };
  }, []); // Empty deps - only run on mount

  const connectWallet = async (selectedWallet: WalletType, selectedNetwork: Network) => {
    try {
      // Only Base ETH supported for now
      await connectEthereumWallet(selectedWallet);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const connectEthereumWallet = async (selectedWallet: WalletType) => {
    let ethereum;
    console.log('🔌 Attempting to connect wallet:', selectedWallet);

    switch (selectedWallet) {
      case 'metamask':
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          console.error('❌ MetaMask not detected');
          throw new Error('MetaMask not found. Please install it from metamask.io');
        }
        console.log('✅ MetaMask detected');
        ethereum = window.ethereum;
        break;
      case 'coinbase':
        if (!window.ethereum || !window.ethereum.isCoinbaseWallet) {
          console.error('❌ Coinbase Wallet not detected');
          throw new Error('Coinbase Wallet not found. Please install it from coinbase.com/wallet');
        }
        console.log('✅ Coinbase Wallet detected');
        ethereum = window.ethereum;
        break;
      case 'phantom':
        // Phantom wallet also supports Ethereum/Base
        if (!window.phantom?.ethereum) {
          console.error('❌ Phantom Ethereum support not detected');
          throw new Error('Phantom wallet Ethereum support not found. Please install or enable Ethereum in Phantom');
        }
        console.log('✅ Phantom Ethereum support detected');
        ethereum = window.phantom.ethereum;
        break;
      default:
        console.error('❌ Unsupported wallet type:', selectedWallet);
        throw new Error('Unsupported Ethereum wallet');
    }

    console.log('🔗 Requesting account access...');
    const provider = new BrowserProvider(ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const walletAddress = accounts[0];
    console.log('✅ Wallet connected:', walletAddress);

    // Switch to Base network (Chain ID: 8453)
    console.log('🌐 Switching to Base network...');
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }],
      });
      console.log('✅ Switched to Base network');
    } catch (switchError: unknown) {
      const error = switchError as { code?: number; message?: string };
      console.log('⚠️ Switch error:', error);
      if (error.code === 4902) {
        console.log('➕ Adding Base network...');
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
        console.log('✅ Base network added');
      }
    }

    // Generate and sign authentication message
    console.log('📝 Signing authentication message...');
    const message = generateAuthMessage(walletAddress);
    
    let signature: string;
    try {
      signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      }) as string;
      console.log('✅ Message signed successfully');
      
      // Verify the signature locally
      const isValid = verifySignature(message, signature, walletAddress);
      if (!isValid) {
        console.error('❌ Signature verification failed');
        throw new Error('Invalid signature');
      }
      console.log('✅ Signature verified');
    } catch (signError) {
      console.error('❌ Failed to sign/verify message:', signError);
      const errorMessage = signError instanceof Error ? signError.message : 'You must sign the message to connect your wallet';
      throw new Error(errorMessage);
    }

    console.log('🔍 Ensuring user exists in database...');
    const uid = await ensureUserExists(walletAddress);
    console.log('✅ User ID:', uid);

    // Store signature for authentication
    localStorage.setItem('wallet_signature', signature);
    localStorage.setItem('wallet_signed_message', message);

    // Update user last seen (non-blocking)
    supabase
      .from('User')
      .update({ lastSeenAt: new Date().toISOString() })
      .eq('id', uid)
      .then(({ error }) => {
        if (error) console.error('Error updating lastSeenAt:', error);
      });
    
    // Update online count (non-blocking)
    supabase.rpc('update_online_count', {
      network_name: 'base',
      count_change: 1,
    }).then(({ error }) => {
      if (error) console.error('Error updating online count:', error);
    });

    // Batch state updates
    setNetwork('base');
    setAddress(walletAddress);
    setUserId(uid);
    setWalletType(selectedWallet);
    setIsConnected(true);
    
    // Update localStorage
    localStorage.setItem('wallet_network', 'base');
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('wallet_type', selectedWallet);
    
    console.log('✅ Wallet connection complete!');
  };

  const disconnect = async () => {
    const networkToCleanup = network;
    
    // Update online count (non-blocking)
    if (networkToCleanup) {
      supabase.rpc('update_online_count', {
        network_name: networkToCleanup,
        count_change: -1,
      }).then(({ error }) => {
        if (error) console.error('Error updating online count on disconnect:', error);
      });
    }
    
    // Batch state updates
    setNetwork(null);
    setAddress(null);
    setUserId(null);
    setWalletType(null);
    setIsConnected(false);
    
    // Clear localStorage
    localStorage.removeItem('wallet_network');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_type');
    
    // Reset restore ref
    hasRestoredRef.current = false;
    restoredNetworkRef.current = null;
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

// Suppress Fast Refresh warning - this is a hook, not a consuming component
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

