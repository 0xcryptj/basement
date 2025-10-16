/**
 * Multi-Chain Wagering System for Arcade Games
 * Supports both Base (ETH) and Solana
 */

import { parseEther, formatEther, Address } from 'viem';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export type Chain = 'base' | 'solana';
export type WagerStatus = 'pending' | 'matched' | 'completed' | 'cancelled';

export interface Wager {
  id: string;
  gameId: string;
  chain: Chain;
  player1: string;
  player2?: string;
  amount: string; // In ETH or SOL
  status: WagerStatus;
  winner?: string;
  txHash?: string;
  createdAt: number;
  expiresAt: number;
}

export interface GameConfig {
  name: string;
  minWager: number;
  maxWager: number;
  matchTimeout: number; // seconds
}

export const GAME_CONFIGS: Record<string, GameConfig> = {
  chess: {
    name: 'Chess',
    minWager: 0.001,
    maxWager: 10,
    matchTimeout: 300, // 5 minutes
  },
  cointoss: {
    name: 'Coin Toss',
    minWager: 0.001,
    maxWager: 5,
    matchTimeout: 60, // 1 minute
  },
  luckyblock: {
    name: 'Lucky Block',
    minWager: 0.001,
    maxWager: 1,
    matchTimeout: 120, // 2 minutes
  },
};

/**
 * Base Chain Wager Handler
 */
export class BaseWagerHandler {
  private contractAddress: Address;
  private contractABI: any;

  constructor(contractAddress: string, contractABI: any) {
    this.contractAddress = contractAddress as Address;
    this.contractABI = contractABI;
  }

  /**
   * Create a new wager on Base
   */
  async createWager(
    playerAddress: string,
    amount: number,
    gameId: string
  ): Promise<Wager> {
    const wager: Wager = {
      id: `base_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId,
      chain: 'base',
      player1: playerAddress,
      amount: amount.toString(),
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (GAME_CONFIGS[gameId]?.matchTimeout || 300) * 1000,
    };

    // Store wager in database/state
    await this.storeWager(wager);
    
    return wager;
  }

  /**
   * Match a wager (player 2 joins)
   */
  async matchWager(
    wagerId: string,
    player2Address: string
  ): Promise<Wager> {
    const wager = await this.getWager(wagerId);
    
    if (!wager) {
      throw new Error('Wager not found');
    }

    if (wager.status !== 'pending') {
      throw new Error('Wager is not available');
    }

    wager.player2 = player2Address;
    wager.status = 'matched';

    await this.updateWager(wager);
    
    return wager;
  }

  /**
   * Complete a wager and determine winner
   */
  async completeWager(
    wagerId: string,
    winner: string,
    txHash: string
  ): Promise<Wager> {
    const wager = await this.getWager(wagerId);
    
    if (!wager) {
      throw new Error('Wager not found');
    }

    wager.winner = winner;
    wager.status = 'completed';
    wager.txHash = txHash;

    await this.updateWager(wager);
    
    return wager;
  }

  private async storeWager(wager: Wager): Promise<void> {
    // Store in localStorage for now (replace with DB in production)
    const wagers = this.getAllWagers();
    wagers.push(wager);
    localStorage.setItem('wagers', JSON.stringify(wagers));
  }

  private async updateWager(wager: Wager): Promise<void> {
    const wagers = this.getAllWagers();
    const index = wagers.findIndex(w => w.id === wager.id);
    if (index !== -1) {
      wagers[index] = wager;
      localStorage.setItem('wagers', JSON.stringify(wagers));
    }
  }

  private async getWager(wagerId: string): Promise<Wager | null> {
    const wagers = this.getAllWagers();
    return wagers.find(w => w.id === wagerId) || null;
  }

  private getAllWagers(): Wager[] {
    const stored = localStorage.getItem('wagers');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get all active wagers for a game
   */
  async getActiveWagers(gameId: string): Promise<Wager[]> {
    const wagers = this.getAllWagers();
    const now = Date.now();
    
    return wagers.filter(w => 
      w.gameId === gameId &&
      w.chain === 'base' &&
      w.status === 'pending' &&
      w.expiresAt > now
    );
  }
}

/**
 * Solana Wager Handler
 */
export class SolanaWagerHandler {
  private connection: Connection;
  private programId: PublicKey;

  constructor(rpcUrl: string, programId: string) {
    this.connection = new Connection(rpcUrl);
    this.programId = new PublicKey(programId);
  }

  /**
   * Create a new wager on Solana
   */
  async createWager(
    playerPubkey: string,
    amount: number,
    gameId: string
  ): Promise<Wager> {
    const wager: Wager = {
      id: `sol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId,
      chain: 'solana',
      player1: playerPubkey,
      amount: amount.toString(),
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (GAME_CONFIGS[gameId]?.matchTimeout || 300) * 1000,
    };

    await this.storeWager(wager);
    
    return wager;
  }

  /**
   * Match a wager (player 2 joins)
   */
  async matchWager(
    wagerId: string,
    player2Pubkey: string
  ): Promise<Wager> {
    const wager = await this.getWager(wagerId);
    
    if (!wager) {
      throw new Error('Wager not found');
    }

    if (wager.status !== 'pending') {
      throw new Error('Wager is not available');
    }

    wager.player2 = player2Pubkey;
    wager.status = 'matched';

    await this.updateWager(wager);
    
    return wager;
  }

  /**
   * Complete a wager and determine winner
   */
  async completeWager(
    wagerId: string,
    winner: string,
    txSignature: string
  ): Promise<Wager> {
    const wager = await this.getWager(wagerId);
    
    if (!wager) {
      throw new Error('Wager not found');
    }

    wager.winner = winner;
    wager.status = 'completed';
    wager.txHash = txSignature;

    await this.updateWager(wager);
    
    return wager;
  }

  private async storeWager(wager: Wager): Promise<void> {
    const wagers = this.getAllWagers();
    wagers.push(wager);
    localStorage.setItem('wagers', JSON.stringify(wagers));
  }

  private async updateWager(wager: Wager): Promise<void> {
    const wagers = this.getAllWagers();
    const index = wagers.findIndex(w => w.id === wager.id);
    if (index !== -1) {
      wagers[index] = wager;
      localStorage.setItem('wagers', JSON.stringify(wagers));
    }
  }

  private async getWager(wagerId: string): Promise<Wager | null> {
    const wagers = this.getAllWagers();
    return wagers.find(w => w.id === wagerId) || null;
  }

  private getAllWagers(): Wager[] {
    const stored = localStorage.getItem('wagers');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get all active wagers for a game
   */
  async getActiveWagers(gameId: string): Promise<Wager[]> {
    const wagers = this.getAllWagers();
    const now = Date.now();
    
    return wagers.filter(w => 
      w.gameId === gameId &&
      w.chain === 'solana' &&
      w.status === 'pending' &&
      w.expiresAt > now
    );
  }
}

/**
 * Unified Multi-Chain Wager Manager
 */
export class MultiChainWagerManager {
  private baseHandler: BaseWagerHandler;
  private solanaHandler: SolanaWagerHandler;

  constructor(
    baseContractAddress: string,
    baseContractABI: any,
    solanaRpcUrl: string,
    solanaProgramId: string
  ) {
    this.baseHandler = new BaseWagerHandler(baseContractAddress, baseContractABI);
    this.solanaHandler = new SolanaWagerHandler(solanaRpcUrl, solanaProgramId);
  }

  /**
   * Create a wager on the specified chain
   */
  async createWager(
    chain: Chain,
    playerAddress: string,
    amount: number,
    gameId: string
  ): Promise<Wager> {
    if (chain === 'base') {
      return this.baseHandler.createWager(playerAddress, amount, gameId);
    } else {
      return this.solanaHandler.createWager(playerAddress, amount, gameId);
    }
  }

  /**
   * Match a wager
   */
  async matchWager(
    wagerId: string,
    chain: Chain,
    player2Address: string
  ): Promise<Wager> {
    if (chain === 'base') {
      return this.baseHandler.matchWager(wagerId, player2Address);
    } else {
      return this.solanaHandler.matchWager(wagerId, player2Address);
    }
  }

  /**
   * Complete a wager
   */
  async completeWager(
    wagerId: string,
    chain: Chain,
    winner: string,
    txHash: string
  ): Promise<Wager> {
    if (chain === 'base') {
      return this.baseHandler.completeWager(wagerId, winner, txHash);
    } else {
      return this.solanaHandler.completeWager(wagerId, winner, txHash);
    }
  }

  /**
   * Get all active wagers across all chains
   */
  async getAllActiveWagers(gameId: string): Promise<Wager[]> {
    const baseWagers = await this.baseHandler.getActiveWagers(gameId);
    const solanaWagers = await this.solanaHandler.getActiveWagers(gameId);
    
    return [...baseWagers, ...solanaWagers].sort((a, b) => b.createdAt - a.createdAt);
  }
}

