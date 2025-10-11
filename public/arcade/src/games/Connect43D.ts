import * as THREE from 'three';
import { GameEngine } from '../engine/GameEngine';
import { Game, GameEnvironmentConfig, GameModuleInterface } from '../types';
import { gsap } from 'gsap';

export class Connect43D implements GameModuleInterface {
  private engine: GameEngine | null = null;
  private board: THREE.Group | null = null;
  private pieces: THREE.Mesh[] = [];
  private readonly ROWS = 6;
  private readonly COLS = 7;
  private readonly PIECE_RADIUS = 0.4;
  private readonly SPACING = 1;

  public init(container: HTMLElement, config: GameEnvironmentConfig): void {
    this.engine = new GameEngine(container, config);
    this.createEnvironment();
  }

  private createEnvironment(): void {
    if (!this.engine) return;
    
    const scene = this.engine.getScene();
    
    // Create board
    this.createBoard(scene);
    
    // Add environment
    this.addEnvironmentDetails(scene);
    
    // Position camera for optimal view
    const camera = this.engine.getCamera();
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 2, 0);
  }

  private createBoard(scene: THREE.Scene): void {
    this.board = new THREE.Group();
    
    // Board frame
    const frameGeometry = new THREE.BoxGeometry(
      this.COLS * this.SPACING + 1,
      this.ROWS * this.SPACING + 1,
      0.5
    );
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0052ff,
      emissive: 0x0052ff,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.castShadow = true;
    frame.receiveShadow = true;
    this.board.add(frame);
    
    // Create holes for pieces
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const x = (col - this.COLS / 2 + 0.5) * this.SPACING;
        const y = (row - this.ROWS / 2 + 0.5) * this.SPACING + 2;
        
        // Hole cylinder (subtract from frame visually)
        const holeGeometry = new THREE.CylinderGeometry(
          this.PIECE_RADIUS + 0.05,
          this.PIECE_RADIUS + 0.05,
          0.6,
          32
        );
        const holeMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.8,
          emissive: 0x0052ff,
          emissiveIntensity: 0.1
        });
        
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(x, y, 0);
        hole.rotation.x = Math.PI / 2;
        this.board.add(hole);
        
        // Add neon glow ring around hole
        const ringGeometry = new THREE.TorusGeometry(
          this.PIECE_RADIUS + 0.1,
          0.02,
          16,
          32
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y, 0.26);
        this.board.add(ring);
      }
    }
    
    // Base stand
    const standGeometry = new THREE.CylinderGeometry(0.5, 1, 2, 8);
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0052ff,
      emissiveIntensity: 0.2
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = -1;
    stand.castShadow = true;
    this.board.add(stand);
    
    this.board.position.y = 0;
    scene.add(this.board);
  }

  private addEnvironmentDetails(scene: THREE.Scene): void {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Spotlights on board
    const spotlightPositions = [
      [-5, 10, 3],
      [5, 10, 3]
    ];
    
    spotlightPositions.forEach((pos, index) => {
      const spotlight = new THREE.SpotLight(
        index === 0 ? 0x0052ff : 0xff00ff,
        2,
        20,
        Math.PI / 6,
        0.5
      );
      spotlight.position.set(pos[0], pos[1], pos[2]);
      spotlight.target.position.set(0, 2, 0);
      spotlight.castShadow = true;
      scene.add(spotlight);
      scene.add(spotlight.target);
    });
    
    // Holographic display above board
    const displayGeometry = new THREE.PlaneGeometry(6, 1);
    const displayMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 7, 0);
    scene.add(display);
  }

  public loadGame(gameData: Game): void {
    console.log('Loading Connect 4 game:', gameData);
    // Load existing game state and render pieces
  }

  public async playAnimation(type: string, data?: any): Promise<void> {
    if (!this.board || !this.engine) return;
    
    switch (type) {
      case 'dropPiece':
        await this.animateDropPiece(data.col, data.row, data.player);
        break;
      case 'winSequence':
        await this.animateWinSequence(data.pieces);
        break;
      case 'rotate':
        this.animateBoardRotation();
        break;
      default:
        console.warn('Unknown animation type:', type);
    }
  }

  private async animateDropPiece(col: number, row: number, player: number): Promise<void> {
    if (!this.board) return;
    
    const x = (col - this.COLS / 2 + 0.5) * this.SPACING;
    const finalY = (row - this.ROWS / 2 + 0.5) * this.SPACING + 2;
    const startY = 8;
    
    // Create piece
    const pieceGeometry = new THREE.CylinderGeometry(
      this.PIECE_RADIUS,
      this.PIECE_RADIUS,
      0.3,
      32
    );
    const pieceMaterial = new THREE.MeshStandardMaterial({
      color: player === 1 ? 0xff0000 : 0xffff00,
      emissive: player === 1 ? 0xff0000 : 0xffff00,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const piece = new THREE.Mesh(pieceGeometry, pieceMaterial);
    piece.position.set(x, startY, 0);
    piece.rotation.x = Math.PI / 2;
    piece.castShadow = true;
    this.board.add(piece);
    this.pieces.push(piece);
    
    // Animate drop with bounce
    return new Promise((resolve) => {
      gsap.to(piece.position, {
        y: finalY,
        duration: 0.8,
        ease: 'bounce.out',
        onComplete: () => resolve()
      });
    });
  }

  private async animateWinSequence(pieces: number[][]): Promise<void> {
    // Highlight winning pieces with pulsing glow
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  }

  private animateBoardRotation(): void {
    if (!this.board) return;
    
    gsap.to(this.board.rotation, {
      y: this.board.rotation.y + Math.PI * 2,
      duration: 4,
      ease: 'power2.inOut'
    });
  }

  public dispose(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    this.board = null;
    this.pieces = [];
  }
}

