import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { GameEnvironmentConfig } from '../types';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private composer: EffectComposer | null = null;
  private animationId: number | null = null;
  private config: GameEnvironmentConfig;

  constructor(container: HTMLElement, config: GameEnvironmentConfig) {
    this.container = container;
    this.config = config;
    
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a); // Dark blue-black basement vibe
    
    // Setup camera
    this.camera = this.createCamera();
    
    // Setup renderer
    this.renderer = this.createRenderer();
    this.container.appendChild(this.renderer.domElement);
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 50;
    this.controls.minDistance = 5;
    
    // Setup lighting
    this.setupLighting();
    
    // Setup post-processing
    if (this.config.postProcessing) {
      this.setupPostProcessing();
    }
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation loop
    this.animate();
  }

  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    return camera;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: false
    });
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (this.config.shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    return renderer;
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
    this.scene.add(ambientLight);
    
    // Main directional light (sun/key light)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = this.config.shadows;
    
    if (mainLight.castShadow) {
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 500;
      mainLight.shadow.camera.left = -50;
      mainLight.shadow.camera.right = 50;
      mainLight.shadow.camera.top = 50;
      mainLight.shadow.camera.bottom = -50;
    }
    
    this.scene.add(mainLight);
    
    // Rim light (Base blue)
    const rimLight = new THREE.DirectionalLight(0x0052ff, 0.8);
    rimLight.position.set(-10, 5, -10);
    this.scene.add(rimLight);
    
    // Fill light
    const fillLight = new THREE.PointLight(0x8080ff, 0.5);
    fillLight.position.set(0, 10, 0);
    this.scene.add(fillLight);
    
    // Neon accent lights
    const neonLight1 = new THREE.PointLight(0x00ffff, 2, 20);
    neonLight1.position.set(-5, 2, 5);
    this.scene.add(neonLight1);
    
    const neonLight2 = new THREE.PointLight(0xff00ff, 2, 20);
    neonLight2.position.set(5, 2, 5);
    this.scene.add(neonLight2);
  }

  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);
    
    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Bloom effect for neon glow
    if (this.config.bloomEffect) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,  // strength
        0.4,  // radius
        0.85  // threshold
      );
      this.composer.addPass(bloomPass);
    }
    
    // Anti-aliasing
    const smaaPass = new SMAAPass(
      window.innerWidth * this.renderer.getPixelRatio(),
      window.innerHeight * this.renderer.getPixelRatio()
    );
    this.composer.addPass(smaaPass);
  }

  private onWindowResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public animateCamera(position: THREE.Vector3, lookAt: THREE.Vector3, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const startPosition = this.camera.position.clone();
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.camera.position.lerpVectors(startPosition, position, eased);
        this.camera.lookAt(lookAt);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.controls.target.copy(lookAt);
          resolve();
        }
      };
      
      animate();
    });
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.onWindowResize);
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    this.controls.dispose();
    
    if (this.composer) {
      this.composer.dispose();
    }
    
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

