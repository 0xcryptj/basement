// Smart contract integration utilities
import { Contract, BrowserProvider, parseEther } from 'ethers';
import WarABI from '../../chain/artifacts/contracts/War.sol/War.json';
import ChessABI from '../../chain/artifacts/contracts/Chess.sol/Chess.json';
import Connect4ABI from '../../chain/artifacts/contracts/Connect4.sol/Connect4.json';

// Deployed contract addresses on Base
export const CONTRACT_ADDRESSES = {
  War: '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC',
  Chess: '0x429e6BF43b9127A9Ee95FD17f17213a35252488b',
  Connect4: '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5',
} as const;

export type GameType = keyof typeof CONTRACT_ADDRESSES;

/**
 * Get contract instance for a game
 */
export async function getGameContract(gameType: GameType): Promise<Contract> {
  const provider = new BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  
  let ABI: any;
  let address: string;
  
  switch (gameType) {
    case 'War':
      ABI = WarABI.abi;
      address = CONTRACT_ADDRESSES.War;
      break;
    case 'Chess':
      ABI = ChessABI.abi;
      address = CONTRACT_ADDRESSES.Chess;
      break;
    case 'Connect4':
      ABI = Connect4ABI.abi;
      address = CONTRACT_ADDRESSES.Connect4;
      break;
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
  
  return new Contract(address, ABI, signer);
}

/**
 * Create a new game on-chain
 */
export async function createGame(gameType: GameType, wagerAmount: number) {
  const contract = await getGameContract(gameType);
  const tx = await contract.createGame({ value: parseEther(wagerAmount.toString()) });
  const receipt = await tx.wait();
  
  // Extract game ID from event
  const event = receipt.logs.find((log: any) => 
    log.topics[0] === contract.interface.getEvent('GameCreated').topicHash
  );
  
  if (!event) throw new Error('GameCreated event not found');
  const gameId = BigInt(event.topics[1]).toString();
  
  return { gameId, txHash: receipt.hash };
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

/**
 * Execute a game move (for Chess/Connect4)
 */
export async function makeMove(gameType: 'Chess' | 'Connect4', gameId: number, moveData: any) {
  const contract = await getGameContract(gameType);
  
  if (gameType === 'Chess') {
    const tx = await contract.makeMove(gameId, moveData.fromX, moveData.fromY, moveData.toX, moveData.toY);
    return await tx.wait();
  } else if (gameType === 'Connect4') {
    const tx = await contract.makeMove(gameId, moveData.col);
    return await tx.wait();
  }
}

/**
 * Cancel/Refund game (if timeout mechanism exists)
 */
export async function cancelGame(gameType: GameType, gameId: number) {
  const contract = await getGameContract(gameType);
  const tx = await contract.cancelGame(gameId);
  return await tx.wait();
}

/**
 * Listen to game events
 */
export async function listenToGameEvents(
  gameType: GameType,
  gameId: number,
  callbacks: {
    onGameJoined?: (data: any) => void;
    onMoveMade?: (data: any) => void;
    onGameComplete?: (data: any) => void;
  }
) {
  const contract = await getGameContract(gameType);
  
  if (callbacks.onGameJoined) {
    contract.on(contract.getEvent('GameJoined'), (eventGameId, player) => {
      if (eventGameId.toString() === gameId.toString()) {
        callbacks.onGameJoined?.({ gameId: eventGameId, player });
      }
    });
  }
  
  if (callbacks.onMoveMade) {
    contract.on(contract.getEvent('MoveMade'), (eventGameId, ...args) => {
      if (eventGameId.toString() === gameId.toString()) {
        callbacks.onMoveMade?.({ gameId: eventGameId, ...args });
      }
    });
  }
  
  if (callbacks.onGameComplete) {
    contract.on(contract.getEvent('GameComplete'), (eventGameId, winner, payout) => {
      if (eventGameId.toString() === gameId.toString()) {
        callbacks.onGameComplete?.({ gameId: eventGameId, winner, payout });
      }
    });
  }
}

