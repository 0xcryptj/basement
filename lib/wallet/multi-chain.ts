import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

export type Chain = 'base' | 'solana';
export type WalletType = 'phantom' | 'metamask' | 'base';

interface WalletState {
  isConnected: boolean;
  chain: Chain;
  walletType: WalletType | null;
  // Ethereum
  ethAddress: string | null;
  ethProvider: ethers.BrowserProvider | null;
  ethSigner: ethers.Signer | null;
  // Solana
  solAddress: string | null;
  solPublicKey: PublicKey | null;
  solConnection: Connection | null;
}

export class MultiChainWallet {
  private state: WalletState = {
    isConnected: false,
    chain: 'base',
    walletType: null,
    ethAddress: null,
    ethProvider: null,
    ethSigner: null,
    solAddress: null,
    solPublicKey: null,
    solConnection: null
  };

  // Connect to Phantom (supports both chains!)
  async connectPhantom(chain: Chain = 'base'): Promise<void> {
    if (typeof window === 'undefined') throw new Error('Not in browser');

    if (chain === 'solana') {
      // Solana mode
      if (!window.phantom?.solana) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet not installed');
      }

      const resp = await window.phantom.solana.connect();
      const publicKey = resp.publicKey;

      this.state = {
        ...this.state,
        isConnected: true,
        chain: 'solana',
        walletType: 'phantom',
        solAddress: publicKey.toString(),
        solPublicKey: publicKey,
        solConnection: new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
      };
    } else {
      // Ethereum/Base mode
      if (!window.phantom?.ethereum) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet not installed');
      }

      await window.phantom.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.phantom.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      this.state = {
        ...this.state,
        isConnected: true,
        chain: 'base',
        walletType: 'phantom',
        ethAddress: address,
        ethProvider: provider,
        ethSigner: signer
      };
    }
  }

  // Connect to MetaMask (Ethereum/Base only)
  async connectMetaMask(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error('MetaMask not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    this.state = {
      ...this.state,
      isConnected: true,
      chain: 'base',
      walletType: 'metamask',
      ethAddress: address,
      ethProvider: provider,
      ethSigner: signer
    };
  }

  // Connect to Base Wallet (Ethereum/Base only)
  async connectBaseWallet(): Promise<void> {
    if (typeof window === 'undefined' || !window.ethereum) {
      window.open('https://wallet.coinbase.com/', '_blank');
      throw new Error('Base Wallet not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    this.state = {
      ...this.state,
      isConnected: true,
      chain: 'base',
      walletType: 'base',
      ethAddress: address,
      ethProvider: provider,
      ethSigner: signer
    };
  }

  // Switch chain (for Phantom only - supports both)
  async switchChain(newChain: Chain): Promise<void> {
    if (this.state.walletType !== 'phantom') {
      throw new Error('Chain switching only supported on Phantom wallet');
    }

    // Disconnect current
    this.disconnect();

    // Reconnect on new chain
    await this.connectPhantom(newChain);
  }

  // Disconnect wallet
  disconnect(): void {
    if (this.state.walletType === 'phantom' && this.state.chain === 'solana') {
      window.phantom?.solana?.disconnect();
    }

    this.state = {
      isConnected: false,
      chain: 'base',
      walletType: null,
      ethAddress: null,
      ethProvider: null,
      ethSigner: null,
      solAddress: null,
      solPublicKey: null,
      solConnection: null
    };
  }

  // Get current state
  getState(): Readonly<WalletState> {
    return { ...this.state };
  }

  // Get display address
  getAddress(): string | null {
    return this.state.chain === 'solana' 
      ? this.state.solAddress 
      : this.state.ethAddress;
  }

  // Get balance
  async getBalance(): Promise<number> {
    if (this.state.chain === 'solana' && this.state.solConnection && this.state.solPublicKey) {
      const balance = await this.state.solConnection.getBalance(this.state.solPublicKey);
      return balance / LAMPORTS_PER_SOL;
    } else if (this.state.ethProvider && this.state.ethAddress) {
      const balance = await this.state.ethProvider.getBalance(this.state.ethAddress);
      return parseFloat(ethers.formatEther(balance));
    }
    return 0;
  }

  // Send Solana transaction
  async sendSolanaTransaction(transaction: Transaction): Promise<string> {
    if (this.state.chain !== 'solana' || !window.phantom?.solana) {
      throw new Error('Not connected to Solana');
    }

    const { signature } = await window.phantom.solana.signAndSendTransaction(transaction);
    return signature;
  }

  // Send Ethereum transaction
  async sendEthereumTransaction(tx: any): Promise<ethers.TransactionResponse> {
    if (this.state.chain !== 'base' || !this.state.ethSigner) {
      throw new Error('Not connected to Base');
    }

    return await this.state.ethSigner.sendTransaction(tx);
  }
}

// Singleton instance
export const multiChainWallet = new MultiChainWallet();

// Type augmentation for window
declare global {
  interface Window {
    phantom?: {
      solana?: {
        connect: () => Promise<{ publicKey: PublicKey }>;
        disconnect: () => Promise<void>;
        signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
        signTransaction: (transaction: Transaction) => Promise<Transaction>;
        signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
        publicKey: PublicKey | null;
        isConnected: boolean;
      };
      ethereum?: any;
    };
    ethereum?: any;
  }
}

