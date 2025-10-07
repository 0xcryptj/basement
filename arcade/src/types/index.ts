import { ethers } from 'ethers';

export interface WalletSession {
  address: string;
  username: string;
  profilePic?: string;
  isConnected: boolean;
}

export interface Game {
  id: number;
  p1: string;
  p1Name: string;
  p2: string | null;
  p2Name: string | null;
  stake: string;
  pot: string;
  state: GameState;
  p1Choice?: string;
  p2Choice?: string | null;
  winner?: string | null;
  createdAt: number;
  filledAt?: number;
}

export enum GameState {
  Open = 0,
  Filled = 1,
  Revealing = 2,
  Settled = 3,
  Cancelled = 4
}

export interface ContractGame {
  p1: string;
  p2: string;
  stake: bigint;
  pot: bigint;
  p1Commit: string;
  p2Commit: string;
  p1Reveal: number;
  p2Reveal: number;
  createdAt: number;
  filledAt: number;
  revealDeadline: number;
  state: number;
}

export interface BotConfig {
  names: string[];
  createProbability: number;
  joinProbability: number;
  revealProbability: number;
  intervalMin: number;
  intervalMax: number;
}

export interface GameEnvironmentConfig {
  antialias: boolean;
  shadows: boolean;
  postProcessing: boolean;
  ambientOcclusion: boolean;
  bloomEffect: boolean;
}

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: { x: number; y: number; z: number };
}

export interface Game3DControls {
  rotate: boolean;
  zoom: boolean;
  pan: boolean;
}

export type GameType = 'cointoss' | 'connect4' | 'war' | 'rps';

export interface GameModuleInterface {
  init(container: HTMLElement, config: GameEnvironmentConfig): void;
  loadGame(gameData: Game): void;
  playAnimation(type: string, data?: any): Promise<void>;
  dispose(): void;
}

