// Smart contract integration utilities
import { Contract, BrowserProvider, parseEther } from 'ethers';
import WarABI from '../../chain/artifacts/contracts/War.sol/War.json';
import ChessABI from '../../chain/artifacts/contracts/Chess.sol/Chess.json';
import Connect4ABI from '../../chain/artifacts/contracts/Connect4.sol/Connect4.json';
import CoinFlipABI from '../../chain/artifacts/contracts/CoinFlip.sol/CoinFlip.json';
import JackpotABI from '../../chain/artifacts/contracts/Jackpot.sol/Jackpot.json';

// Deployed contract addresses on Base - ADD ACTUAL DEPLOYED ADDRESSES
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5',
  CoinFlip: '0x0000000000000000000000000000000000000000', // TODO: Deploy and add address
  Jackpot: '0x0000000000000000000000000000000000000000', // TODO: Deploy and add address
} as const;

export type GameType = keyof typeof CONTRACT_ADDRESSES;

/**
 * Get contract instance for a game
 */
export async function getGameContract(gameType: GameType): Promise<Contract> {
  if (!window.ethereum) {
    throw new Error('MetaMask or other Ethereum provider not found. Please install a wallet.');
  }
  
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  let ABI: unknown[];
  let address: string;
  
  console.log('🔧 Getting contract for game type:', gameType);
  
  switch (gameType.toLowerCase()) {
    case 'war':
      ABI = WarABI.abi;
      address = CONTRACT_ADDRESSES.War;
      break;
    case 'chess':
      ABI = ChessABI.abi;
      address = CONTRACT_ADDRESSES.Chess;
      break;
    case 'connect4':
      ABI = Connect4ABI.abi;
      address = CONTRACT_ADDRESSES.Connect4;
      break;
    default:
      console.error('Unknown game type:', gameType);
      throw new Error(`Unknown game type: ${gameType}. Supported types: war, chess, connect4`);
  }
  
  console.log('✅ Contract address:', address);
  return new Contract(address, ABI, signer);
}

/**
 * Create a new game on-chain
 */
export async function createGame(gameType: GameType, wagerAmount: number) {
  console.log('📝 Creating game on-chain:', gameType, wagerAmount);
  
  try {
    const contract = await getGameContract(gameType);
    console.log('✅ Contract instance created');
    
    console.log('⏳ Sending transaction to create game...');
    const tx = await contract.createGame({ value: parseEther(wagerAmount.toString()) });
    console.log('✅ Transaction sent, waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    
  // Extract game ID from event
  const event = receipt.logs.find((log: unknown) => {
    const logWithTopics = log as { topics: string[] };
    return logWithTopics.topics[0] === contract.interface.getEvent('GameCreated').topicHash;
  });
    
    if (!event) throw new Error('GameCreated event not found');
    const gameId = BigInt(event.topics[1]).toString();
    
    console.log('🎮 Game created with ID:', gameId);
    return { gameId, txHash: receipt.hash };
  } catch (error) {
    console.error('❌ Error creating game:', error);
    throw error;
  }
}

/**
 * Join an existing game
 */
export async function joinGame(gameType: GameType, gameId: number, wagerAmount: number) {
  const contract = await getGameContract(gameType);
  const tx = await contract.joinGame(gameId, { value: parseEther(wagerAmount.toString()) });
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

/**
 * Get game state from contract
 */
export async function getGameState(gameType: GameType, gameId: number) {
  const contract = await getGameContract(gameType);
  const game = await contract.games(gameId);
  return game;
}

interface ChessMoveData {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface Connect4MoveData {
  col: number;
}

/**
 * Execute a game move (for Chess/Connect4)
 */
export async function makeMove(gameType: 'Chess' | 'Connect4', gameId: number, moveData: ChessMoveData | Connect4MoveData) {
  const contract = await getGameContract(gameType);
  
  if (gameType === 'Chess') {
    const chessData = moveData as ChessMoveData;
    const tx = await contract.makeMove(gameId, chessData.fromX, chessData.fromY, chessData.toX, chessData.toY);
    return await tx.wait();
  } else if (gameType === 'Connect4') {
    const connect4Data = moveData as Connect4MoveData;
    const tx = await contract.makeMove(gameId, connect4Data.col);
    return await tx.wait();
  }
}

/**
 * Cancel/Refund game for timeout - refund 96% to player
 */
export async function cancelGame(gameType: GameType, gameId: number) {
  const contract = await getGameContract(gameType);
  
  try {
    // Check if the contract has a cancelGame function
    if (contract.cancelGame) {
      const tx = await contract.cancelGame(gameId);
      return await tx.wait();
    } else {
      // If no cancelGame function exists, we need to implement manual refund
      // This would require the contracts to be updated
      throw new Error('Cancel game function not available in contract');
    }
  } catch (error) {
    console.error('Error canceling game:', error);
    throw error;
  }
}

/**
 * Check game timeout and refund if needed
 * This should be called periodically by the frontend
 */
export async function checkAndProcessTimeout(
  gameType: GameType,
  gameId: number,
  createdAt: string
): Promise<boolean> {
  const now = Date.now();
  const gameCreatedAt = new Date(createdAt).getTime();
  const elapsed = (now - gameCreatedAt) / 1000; // seconds
  
  // 60 second timeout
  if (elapsed >= 60) {
    try {
      await cancelGame(gameType, gameId);
      return true; // Refund processed
    } catch (error) {
      console.error('Failed to process timeout refund:', error);
      return false;
    }
  }
  
  return false; // Not timed out yet
}

/**
 * Listen to game events
 */
export async function listenToGameEvents(
  gameType: GameType,
  gameId: number,
  callbacks: {
  onGameJoined?: (data: { gameId: unknown; player: string }) => void;
  onMoveMade?: (data: { gameId: unknown; [key: string]: unknown }) => void;
  onGameComplete?: (data: { gameId: unknown; winner: string; payout: unknown }) => void;
  }
) {
  const contract = await getGameContract(gameType);
  
  if (callbacks.onGameJoined) {
    contract.on(contract.getEvent('GameJoined'), (eventGameId: unknown, player: string) => {
      if (eventGameId && eventGameId.toString() === gameId.toString()) {
        callbacks.onGameJoined?.({ gameId: eventGameId, player });
      }
    });
  }
  
  if (callbacks.onMoveMade) {
    contract.on(contract.getEvent('MoveMade'), (eventGameId: unknown, ...args: unknown[]) => {
      if (eventGameId && eventGameId.toString() === gameId.toString()) {
        callbacks.onMoveMade?.({ gameId: eventGameId, ...args });
      }
    });
  }
  
  if (callbacks.onGameComplete) {
    contract.on(contract.getEvent('GameComplete'), (eventGameId: unknown, winner: string, payout: unknown) => {
      if (eventGameId && eventGameId.toString() === gameId.toString()) {
        callbacks.onGameComplete?.({ gameId: eventGameId, winner, payout });
      }
    });
  }
}

