import * as THREE from 'three';
import { GameEngine } from '../engine/GameEngine';
import { Game, GameEnvironmentConfig, GameModuleInterface } from '../types';
import { gsap } from 'gsap';

export class CoinToss3D implements GameModuleInterface {
  private engine: GameEngine | null = null;
  private coin: THREE.Mesh | null = null;
  private table: THREE.Mesh | null = null;
  private particles: THREE.Points | null = null;

  public init(container: HTMLElement, config: GameEnvironmentConfig): void {
    this.engine = new GameEngine(container, config);
    this.createEnvironment();
  }

  private createEnvironment(): void {
    if (!this.engine) return;
    
    const scene = this.engine.getScene();
    
    // Create gaming table
    this.createTable(scene);
    
    // Create the coin
    this.createCoin(scene);
    
    // Create particle system for effects
    this.createParticles(scene);
    
    // Add environment details
    this.addEnvironmentDetails(scene);
  }

  private createTable(scene: THREE.Scene): void {
    // Table surface
    const tableGeometry = new THREE.BoxGeometry(15, 0.5, 10);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0x0052ff,
      emissiveIntensity: 0.1
    });
    
    this.table = new THREE.Mesh(tableGeometry, tableMaterial);
    this.table.position.y = -0.25;
    this.table.receiveShadow = true;
    scene.add(this.table);
    
    // Table edges with neon glow
    const edgeGeometry = new THREE.BoxGeometry(15.2, 0.1, 10.2);
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0052ff,
      emissive: 0x0052ff,
      emissiveIntensity: 2,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const tableEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    tableEdge.position.y = 0.05;
    scene.add(tableEdge);
    
    // Grid pattern on table
    const gridHelper = new THREE.GridHelper(15, 20, 0x0052ff, 0x1a1a2e);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
  }

  private createCoin(scene: THREE.Scene): void {
    // Coin geometry
    const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    
    // Heads side material (blue)
    const headsMaterial = new THREE.MeshStandardMaterial({
      color: 0x0052ff,
      emissive: 0x0052ff,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.9
    });
    
    // Tails side material (purple)
    const tailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.9
    });
    
    // Create coin with both materials
    this.coin = new THREE.Mesh(coinGeometry, [headsMaterial, headsMaterial, tailsMaterial]);
    this.coin.position.set(0, 5, 0);
    this.coin.rotation.x = Math.PI / 2;
    this.coin.castShadow = true;
    scene.add(this.coin);
    
    // Add "H" text on heads side
    this.addCoinText('H', 0x0052ff, new THREE.Vector3(0, 0.06, 0));
    
    // Add "T" text on tails side
    this.addCoinText('T', 0xff00ff, new THREE.Vector3(0, -0.06, 0));
    
    // Coin glow effect
    const glowGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0052ff,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.coin.add(glow);
  }

  private addCoinText(text: string, color: number, position: THREE.Vector3): void {
    // For production, use THREE.TextGeometry with a loaded font
    // For now, we'll use a simple shape as placeholder
    const textShape = new THREE.Shape();
    textShape.moveTo(0, 0);
    textShape.lineTo(0, 0.4);
    textShape.lineTo(0.3, 0.4);
    textShape.lineTo(0.3, 0);
    
    const textGeometry = new THREE.ShapeGeometry(textShape);
    const textMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);
    textMesh.scale.set(0.5, 0.5, 0.5);
    textMesh.position.x = -0.075;
    textMesh.position.z = -0.1;
    
    if (this.coin) {
      this.coin.add(textMesh);
    }
  }

  private createParticles(scene: THREE.Scene): void {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 30;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.55, 1, 0.5); // Blue-purple range
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(this.particles);
  }

  private addEnvironmentDetails(scene: THREE.Scene): void {
    // Add corner pillars with neon lights
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 15, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0052ff,
      emissiveIntensity: 0.2
    });
    
    const positions = [
      [-8, 7.5, -5],
      [8, 7.5, -5],
      [-8, 7.5, 5],
      [8, 7.5, 5]
    ];
    
    positions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial.clone());
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      scene.add(pillar);
      
      // Add neon ring on top
      const ringGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 3,
        metalness: 1,
        roughness: 0
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(pos[0], 15, pos[2]);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });
  }

  public loadGame(gameData: Game): void {
    console.log('Loading coin toss game:', gameData);
    // Update UI or environment based on game data
  }

  public async playAnimation(type: string, data?: any): Promise<void> {
    if (!this.coin || !this.engine) return;
    
    switch (type) {
      case 'flip':
        await this.animateCoinFlip(data?.result || 'heads');
        break;
      case 'idle':
        this.animateIdleRotation();
        break;
      case 'celebrate':
        await this.animateCelebration();
        break;
      default:
        console.warn('Unknown animation type:', type);
    }
  }

  private async animateCoinFlip(result: string): Promise<void> {
    if (!this.coin) return;
    
    const spins = 10 + Math.floor(Math.random() * 5); // 10-15 spins
    const duration = 2.5;
    
    // Determine final rotation based on result
    const finalRotation = result === 'heads' ? 0 : Math.PI;
    const totalRotation = spins * Math.PI * 2 + finalRotation;
    
    return new Promise((resolve) => {
      // Animate coin flip
      gsap.to(this.coin!.position, {
        y: 8,
        duration: duration * 0.5,
        ease: 'power2.out'
      });
      
      gsap.to(this.coin!.rotation, {
        x: totalRotation,
        duration: duration,
        ease: 'power3.inOut',
        onComplete: () => {
          // Land on table
          gsap.to(this.coin!.position, {
            y: 0.5,
            duration: 0.5,
            ease: 'bounce.out',
            onComplete: () => resolve()
          });
        }
      });
      
      // Animate camera for dramatic effect
      const camera = this.engine!.getCamera();
      gsap.to(camera.position, {
        y: camera.position.y + 2,
        duration: duration * 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
    });
  }

  private animateIdleRotation(): void {
    if (!this.coin) return;
    
    gsap.to(this.coin.rotation, {
      y: Math.PI * 2,
      duration: 4,
      repeat: -1,
      ease: 'none'
    });
  }

  private async animateCelebration(): Promise<void> {
    // Burst of particles, flash effects, etc.
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  public dispose(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    this.coin = null;
    this.table = null;
    this.particles = null;
  }
}

