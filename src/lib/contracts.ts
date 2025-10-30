// Smart contract integration utilities
import { Contract, BrowserProvider, parseEther } from 'ethers';
import WarABI from '../../chain/artifacts/contracts/War.sol/War.json';
import ChessABI from '../../chain/artifacts/contracts/Chess.sol/Chess.json';
import Connect4ABI from '../../chain/artifacts/contracts/Connect4.sol/Connect4.json';

// CoinFlip and Jackpot ABIs - dynamically imported
let CoinFlipABI: { abi: unknown[] } | null = null;
let JackpotABI: { abi: unknown[] } | null = null;

// Dynamically load ABIs - placeholder files exist for build, will be replaced after compilation
async function loadCoinFlipABI(): Promise<{ abi: unknown[] } | null> {
  if (CoinFlipABI) return CoinFlipABI;
  
  try {
    const module = await import('../../chain/artifacts/contracts/CoinFlip.sol/CoinFlip.json');
    CoinFlipABI = module.default || module;
    // Check if this is a placeholder (empty ABI) - will be replaced after contract compilation
    if (!CoinFlipABI || !CoinFlipABI.abi || CoinFlipABI.abi.length === 0) {
      console.warn('CoinFlip ABI is placeholder - contract may not be compiled yet');
      return null;
    }
    return CoinFlipABI;
  } catch {
    console.warn('CoinFlip ABI not found - contract may not be compiled yet');
    return null;
  }
}

async function loadJackpotABI(): Promise<{ abi: unknown[] } | null> {
  if (JackpotABI) return JackpotABI;
  
  try {
    const module = await import('../../chain/artifacts/contracts/Jackpot.sol/Jackpot.json');
    JackpotABI = module.default || module;
    // Check if this is a placeholder (empty ABI) - will be replaced after contract compilation
    if (!JackpotABI || !JackpotABI.abi || JackpotABI.abi.length === 0) {
      console.warn('Jackpot ABI is placeholder - contract may not be compiled yet');
      return null;
    }
    return JackpotABI;
  } catch {
    console.warn('Jackpot ABI not found - contract may not be compiled yet');
    return null;
  }
}

// Deployed contract addresses on Base
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5',
  CoinFlip: '0xbdfa64c941bc93F27D575Fe5b75857bAfabacD29',
  Jackpot: '0xCb6bA90c6Fc0fD68152a044100928E007Fe983c9',
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
  
  const gameTypeLower = gameType.toLowerCase();
  
  switch (gameTypeLower) {
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
    case 'coinflip': {
      const abiData = await loadCoinFlipABI();
      if (!abiData) {
        throw new Error('CoinFlip ABI not found. Please compile the contract first.');
      }
      ABI = abiData.abi;
      address = CONTRACT_ADDRESSES.CoinFlip;
      break;
    }
    case 'jackpot': {
      const abiData = await loadJackpotABI();
      if (!abiData) {
        throw new Error('Jackpot ABI not found. Please compile the contract first.');
      }
      ABI = abiData.abi;
      address = CONTRACT_ADDRESSES.Jackpot;
      break;
    }
    default:
      console.error('Unknown game type:', gameType);
      throw new Error(`Unknown game type: ${gameType}. Supported types: war, chess, connect4, coinflip, jackpot`);
  }
  
  console.log('✅ Contract address:', address);
  return new Contract(address, ABI, signer);
}

/**
 * Create a new game on-chain
 * For CoinFlip, chosenSide is required (0 = heads, 1 = tails)
 */
export async function createGame(
  gameType: GameType,
  wagerAmount: number,
  chosenSide?: number // Required for CoinFlip (0 = heads, 1 = tails)
) {
  console.log('📝 Creating game on-chain:', gameType, wagerAmount, chosenSide);
  
  try {
    const contract = await getGameContract(gameType);
    console.log('✅ Contract instance created');
    
    let tx;
    
    // CoinFlip has different signature: createGame(uint8 chosenSide)
    if (gameType.toLowerCase() === 'coinflip') {
      if (chosenSide === undefined || (chosenSide !== 0 && chosenSide !== 1)) {
        throw new Error('CoinFlip requires chosenSide parameter: 0 for heads, 1 for tails');
      }
      console.log('⏳ Sending CoinFlip transaction with chosenSide:', chosenSide);
      tx = await contract.createGame(chosenSide, { value: parseEther(wagerAmount.toString()) });
    } else {
      // War, Chess, Connect4 use standard createGame() with value
      console.log('⏳ Sending transaction to create game...');
      tx = await contract.createGame({ value: parseEther(wagerAmount.toString()) });
    }
    
    console.log('✅ Transaction sent, waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    
    // Extract game ID from event
    let event;
    try {
      const eventName = gameType.toLowerCase() === 'coinflip' ? 'GameCreated' : 'GameCreated';
      event = receipt.logs.find((log: unknown) => {
        const logWithTopics = log as { topics: string[] };
        try {
          return logWithTopics.topics[0] === contract.interface.getEvent(eventName).topicHash;
        } catch {
          return false;
        }
      });
    } catch (err) {
      console.warn('Could not parse event, extracting from logs directly:', err);
    }
    
    if (!event) {
      // For CoinFlip, game completes immediately, so we might not find GameCreated
      // Try to extract from transaction logs or return transaction hash
      console.warn('GameCreated event not found, using transaction hash');
      return { gameId: null, txHash: receipt.hash };
    }
    
    const gameId = BigInt((event as { topics: string[] }).topics[1] || '0').toString();
    
    console.log('🎮 Game created with ID:', gameId);
    return { gameId, txHash: receipt.hash };
  } catch (error) {
    console.error('❌ Error creating game:', error);
    throw error;
  }
}

/**
 * Join an existing game (War, Chess, Connect4)
 * For Jackpot, use joinJackpot() instead
 */
export async function joinGame(gameType: GameType, gameId: number, wagerAmount: number) {
  if (gameType.toLowerCase() === 'jackpot') {
    throw new Error('Use joinJackpot() function for Jackpot games');
  }
  
  const contract = await getGameContract(gameType);
  const tx = await contract.joinGame(gameId, { value: parseEther(wagerAmount.toString()) });
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

/**
 * Join the jackpot pool (Jackpot-specific)
 */
export async function joinJackpot(wagerAmount: number) {
  const contract = await getGameContract('Jackpot');
  const tx = await contract.joinJackpot({ value: parseEther(wagerAmount.toString()) });
  const receipt = await tx.wait();
  
  // Extract game ID from PlayerJoined event
  let gameId: string | null = null;
  try {
    const event = receipt.logs.find((log: unknown) => {
      const logWithTopics = log as { topics: string[] };
      try {
        return logWithTopics.topics[0] === contract.interface.getEvent('PlayerJoined').topicHash;
      } catch {
        return false;
      }
    });
    
    if (event) {
      gameId = BigInt((event as { topics: string[] }).topics[1] || '0').toString();
    }
  } catch (err) {
    console.warn('Could not extract gameId from PlayerJoined event:', err);
  }
  
  return { gameId, txHash: receipt.hash };
}

/**
 * Finalize jackpot and select winner (Jackpot-specific)
 */
export async function finalizeJackpot() {
  const contract = await getGameContract('Jackpot');
  const tx = await contract.finalizeJackpot();
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

/**
 * Get current jackpot game (Jackpot-specific)
 */
export async function getCurrentJackpotGame() {
  const contract = await getGameContract('Jackpot');
  const game = await contract.getCurrentGame();
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
export async function makeMove(
  gameType: 'Chess' | 'Connect4',
  gameId: number,
  moveData: ChessMoveData | Connect4MoveData
) {
  const contract = await getGameContract(gameType);
  
  if (gameType === 'Chess') {
    const chessData = moveData as ChessMoveData;
    const tx = await contract.makeMove(
      gameId,
      chessData.fromX,
      chessData.fromY,
      chessData.toX,
      chessData.toY
    );
    return await tx.wait();
  } else if (gameType === 'Connect4') {
    const connect4Data = moveData as Connect4MoveData;
    const tx = await contract.makeMove(gameId, connect4Data.col);
    return await tx.wait();
  }
  
  throw new Error(`makeMove not supported for game type: ${gameType}`);
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
    contract.on(
      contract.getEvent('GameComplete'),
      (eventGameId: unknown, winner: string, payout: unknown) => {
        if (eventGameId && eventGameId.toString() === gameId.toString()) {
          callbacks.onGameComplete?.({ gameId: eventGameId, winner, payout });
        }
      }
    );
  }
}
