import { ethers } from 'ethers';
import { CoinToss3D } from './games/CoinToss3D';
import { Connect43D } from './games/Connect43D';
import { WalletSession, Game, GameState, GameType, GameEnvironmentConfig } from './types';

// Demo Mode Configuration
const DEMO_MODE = true;
let demoGames: Game[] = [];
let demoGameIdCounter = 0;
let botInterval: NodeJS.Timeout | null = null;
let currentGameModule: any = null;
let current3DContainer: HTMLElement | null = null;

// Bot names
const BOT_NAMES = [
    'CryptoWhale', 'DiamondHands', 'MoonBoy', 'BasedDev', 'DeFiKing',
    'NFTCollector', 'GasGuzzler', 'SmartContract', 'TokenMaster', 'BlockChainBro'
];

// Contract configuration
const COIN_TOSS_ADDRESS = "0x0000000000000000000000000000000000000000";
const COIN_TOSS_ABI = [
    "function createGame(bytes32 commit) external payable returns (uint256 id)",
    "function joinGame(uint256 id, bytes32 commit) external payable",
    "function reveal(uint256 id, uint8 choice, bytes32 salt) external",
    "function requiredWithFee(uint256 stake) public pure returns (uint256)",
    "function games(uint256) public view returns (address p1, address p2, uint256 stake, uint256 pot, bytes32 p1Commit, bytes32 p2Commit, uint8 p1Reveal, uint8 p2Reveal, uint64 createdAt, uint64 filledAt, uint64 revealDeadline, uint8 state)",
    "function nextId() public view returns (uint256)",
    "event GameCreated(uint256 id, address creator, uint256 stake)",
    "event GameJoined(uint256 id, address joiner)",
    "event Revealed(uint256 id, address player, uint8 choice)",
    "event Settled(uint256 id, address winner, uint256 payout, uint256 houseCut)"
];

// Arcade App Class
class ArcadeApp {
    private isConnected: boolean = false;
    private walletAddress: string | null = null;
    private username: string | null = null;
    private profilePic: string | null = null;
    private coinTossContract: ethers.Contract | null = null;
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.Signer | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        this.loadWalletSession();
        this.updateWalletUI();
        
        if (this.isConnected) {
            await this.initializeContract();
        }
        
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'basement_walletAddress' || e.key === 'basement_isConnected') {
                this.loadWalletSession();
                this.updateWalletUI();
            }
        });
        
        if (DEMO_MODE) {
            initDemoMode();
        }
    }

    private disconnectWallet(): void {
        localStorage.removeItem('basement_walletAddress');
        localStorage.removeItem('basement_username');
        localStorage.removeItem('basement_profilePic');
        localStorage.removeItem('basement_isConnected');
        window.location.href = '../index.html';
    }

    private loadWalletSession(): boolean {
        const savedWalletAddress = localStorage.getItem('basement_walletAddress');
        const savedUsername = localStorage.getItem('basement_username');
        const savedProfilePic = localStorage.getItem('basement_profilePic');
        const savedIsConnected = localStorage.getItem('basement_isConnected');
        
        if (savedWalletAddress && savedUsername && savedIsConnected === 'true') {
            this.walletAddress = savedWalletAddress;
            this.username = savedUsername;
            this.isConnected = true;
            
            if (savedProfilePic) {
                this.profilePic = savedProfilePic;
            }
            
            console.log('✅ Wallet session loaded:', this.username);
            return true;
        } else {
            this.isConnected = false;
            console.log('❌ No wallet session found');
            return false;
        }
    }

    private updateWalletUI(): void {
        const walletConnectedDisplay = document.getElementById('wallet-connected-display');
        const walletNotConnected = document.getElementById('wallet-not-connected');
        const walletAddress = document.getElementById('wallet-address');
        
        if (this.isConnected) {
            if (walletConnectedDisplay) walletConnectedDisplay.style.display = 'flex';
            if (walletNotConnected) walletNotConnected.style.display = 'none';
            
            if (walletAddress) {
                const displayText = this.username || this.walletAddress;
                walletAddress.innerHTML = `<span class="wallet-display">${displayText}</span>`;
            }
            
            this.updateProfilePic();
        } else {
            if (walletConnectedDisplay) walletConnectedDisplay.style.display = 'none';
            if (walletNotConnected) walletNotConnected.style.display = 'block';
        }
    }

    private updateProfilePic(): void {
        const profilePic = document.getElementById('profile-pic') as HTMLImageElement;
        const profilePicPlaceholder = document.getElementById('profile-pic-placeholder');
        
        if (this.profilePic && profilePic) {
            profilePic.src = this.profilePic;
            profilePic.style.display = 'block';
            if (profilePicPlaceholder) profilePicPlaceholder.style.display = 'none';
        } else if (profilePic) {
            profilePic.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDUyZmY5OSIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiNmZmZmZmYiLz4KICA8cGF0aCBkPSJNMTAgMzBDMTAgMjUgMTMgMjAgMjAgMjBTMzAgMjUgMzAgMzBWMzVIMTBWMzBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
            profilePic.style.display = 'block';
            if (profilePicPlaceholder) profilePicPlaceholder.style.display = 'none';
        }
    }

    private async initializeContract(): Promise<void> {
        if (COIN_TOSS_ADDRESS !== "0x0000000000000000000000000000000000000000") {
            try {
                if (typeof (window as any).ethereum !== 'undefined') {
                    this.provider = new ethers.BrowserProvider((window as any).ethereum);
                    this.signer = await this.provider.getSigner();
                    this.coinTossContract = new ethers.Contract(COIN_TOSS_ADDRESS, COIN_TOSS_ABI, this.signer);
                    console.log('✅ Contract initialized');
                }
            } catch (error) {
                console.error('❌ Failed to initialize contract:', error);
            }
        }
    }

    public getWalletAddress(): string | null {
        return this.walletAddress;
    }

    public getUsername(): string | null {
        return this.username;
    }

    public isWalletConnected(): boolean {
        return this.isConnected;
    }
}

// Initialize app
let arcadeApp: ArcadeApp;
document.addEventListener('DOMContentLoaded', () => {
    arcadeApp = new ArcadeApp();
});

// Demo Mode Functions
function initDemoMode(): void {
    console.log('🤖 Demo Mode Active - Bots will create and play games');
    
    const savedGames = localStorage.getItem('basement_demo_games');
    if (savedGames) {
        demoGames = JSON.parse(savedGames);
        demoGameIdCounter = demoGames.length;
    } else {
        createInitialDemoGames();
    }
    
    startBotActivity();
}

function createInitialDemoGames(): void {
    const initialGames = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < initialGames; i++) {
        const stake = (Math.random() * 0.09 + 0.01).toFixed(3);
        const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const botAddress = generateBotAddress();
        
        demoGames.push({
            id: demoGameIdCounter++,
            p1: botAddress,
            p1Name: botName,
            p2: null,
            p2Name: null,
            stake: stake,
            pot: stake,
            state: GameState.Open,
            p1Choice: Math.random() > 0.5 ? 'Heads' : 'Tails',
            p2Choice: null,
            winner: null,
            createdAt: Date.now() - Math.random() * 300000
        });
    }
    
    saveDemoGames();
}

function startBotActivity(): void {
    botInterval = setInterval(() => {
        const action = Math.random();
        
        if (action < 0.3) {
            botCreateGame();
        } else if (action < 0.7) {
            botJoinGame();
        } else {
            botRevealGame();
        }
        
        refreshGamesList();
    }, 15000 + Math.random() * 15000);
}

function botCreateGame(): void {
    const stake = (Math.random() * 0.09 + 0.01).toFixed(3);
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const botAddress = generateBotAddress();
    
    demoGames.push({
        id: demoGameIdCounter++,
        p1: botAddress,
        p1Name: botName,
        p2: null,
        p2Name: null,
        stake: stake,
        pot: stake,
        state: GameState.Open,
        p1Choice: Math.random() > 0.5 ? 'Heads' : 'Tails',
        p2Choice: null,
        winner: null,
        createdAt: Date.now()
    });
    
    saveDemoGames();
    console.log(`🤖 ${botName} created game #${demoGameIdCounter - 1} with ${stake} ETH`);
}

function botJoinGame(): void {
    const openGames = demoGames.filter(g => g.state === GameState.Open);
    if (openGames.length === 0) return;
    
    const game = openGames[Math.floor(Math.random() * openGames.length)];
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const botAddress = generateBotAddress();
    
    game.p2 = botAddress;
    game.p2Name = botName;
    game.p2Choice = Math.random() > 0.5 ? 'Heads' : 'Tails';
    game.state = GameState.Filled;
    game.pot = (parseFloat(game.stake) * 2).toFixed(3);
    game.filledAt = Date.now();
    
    saveDemoGames();
    console.log(`🤖 ${botName} joined game #${game.id}`);
    
    setTimeout(() => {
        botRevealSpecificGame(game.id);
    }, 3000 + Math.random() * 2000);
}

function botRevealGame(): void {
    const filledGames = demoGames.filter(g => g.state === GameState.Filled);
    if (filledGames.length === 0) return;
    
    const game = filledGames[Math.floor(Math.random() * filledGames.length)];
    botRevealSpecificGame(game.id);
}

function botRevealSpecificGame(gameId: number): void {
    const game = demoGames.find(g => g.id === gameId);
    if (!game || game.state !== GameState.Filled) return;
    
    game.winner = Math.random() > 0.5 ? game.p1 : game.p2!;
    game.state = GameState.Settled;
    saveDemoGames();
    console.log(`🎉 Game #${game.id} settled! Winner: ${game.winner === game.p1 ? game.p1Name : game.p2Name}`);
    
    setTimeout(() => {
        demoGames = demoGames.filter(g => g.id !== gameId);
        saveDemoGames();
        refreshGamesList();
    }, 30000);
}

function generateBotAddress(): string {
    return '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

function saveDemoGames(): void {
    localStorage.setItem('basement_demo_games', JSON.stringify(demoGames));
}

function refreshGamesList(): void {
    loadOpenGames();
    loadMyGames();
}

// Game Loading Functions - Now with 3D!
function openCoinTossModal(): void {
    const modal = document.getElementById('coin-toss-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Create 3D environment
        setTimeout(() => {
            load3DGame('cointoss');
        }, 100);
        
        switchCoinTossTab('create');
        loadOpenGames();
    }
}

function load3DGame(gameType: GameType): void {
    // Clean up previous game
    if (currentGameModule) {
        currentGameModule.dispose();
        currentGameModule = null;
    }
    
    // Find or create 3D container
    let container = document.getElementById('game-3d-container');
    if (!container) {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            container = document.createElement('div');
            container.id = 'game-3d-container';
            container.style.width = '100%';
            container.style.height = '400px';
            container.style.marginTop = '20px';
            container.style.borderRadius = '10px';
            container.style.overflow = 'hidden';
            container.style.border = '2px solid rgba(0, 82, 255, 0.5)';
            
            const descElement = modalContent.querySelector('.modal-description');
            if (descElement && descElement.parentNode) {
                descElement.parentNode.insertBefore(container, descElement.nextSibling);
            }
        }
    }
    
    if (!container) return;
    current3DContainer = container as HTMLElement;
    
    const config: GameEnvironmentConfig = {
        antialias: true,
        shadows: true,
        postProcessing: true,
        ambientOcclusion: false,
        bloomEffect: true
    };
    
    switch (gameType) {
        case 'cointoss':
            currentGameModule = new CoinToss3D();
            currentGameModule.init(current3DContainer, config);
            currentGameModule.playAnimation('idle');
            break;
        case 'connect4':
            currentGameModule = new Connect43D();
            currentGameModule.init(current3DContainer, config);
            break;
        default:
            console.warn('3D environment not yet implemented for:', gameType);
    }
}

// Placeholder game functions
function openConnect4Modal(): void {
    const modal = document.getElementById('connect4-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => load3DGame('connect4'), 100);
    }
}

function openWarModal(): void {
    alert('War card game coming soon! Smart contract under development.');
}

function openRPSModal(): void {
    alert('Rock Paper Scissors coming soon! Smart contract under development.');
}

function closeCoinTossModal(): void {
    const modal = document.getElementById('coin-toss-modal');
    if (modal) modal.style.display = 'none';
    cleanup3DGame();
}

function closeConnect4Modal(): void {
    const modal = document.getElementById('connect4-modal');
    if (modal) modal.style.display = 'none';
    cleanup3DGame();
}

function closeWarModal(): void {
    const modal = document.getElementById('war-modal');
    if (modal) modal.style.display = 'none';
}

function closeRPSModal(): void {
    const modal = document.getElementById('rps-modal');
    if (modal) modal.style.display = 'none';
}

function cleanup3DGame(): void {
    if (currentGameModule) {
        currentGameModule.dispose();
        currentGameModule = null;
    }
    
    const container = document.getElementById('game-3d-container');
    if (container) {
        container.remove();
    }
}

// Tab switching
function switchCoinTossTab(tab: string): void {
    document.querySelectorAll('#coin-toss-modal .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#coin-toss-modal .tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'create') {
        document.getElementById('create-tab')?.classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[0].classList.add('active');
    } else if (tab === 'join') {
        document.getElementById('join-tab')?.classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[1].classList.add('active');
        loadOpenGames();
    } else if (tab === 'my-games') {
        document.getElementById('my-games-tab')?.classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[2].classList.add('active');
        loadMyGames();
    }
}

// Game list functions
function loadOpenGames(): void {
    const listElement = document.getElementById('open-games-list');
    if (!listElement) return;
    
    if (DEMO_MODE) {
        const openGames = demoGames.filter(g => g.state === GameState.Open);
        
        if (openGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No open games. Bots will create some soon!</p>';
            return;
        }
        
        let html = '';
        for (const game of openGames) {
            const isOwnGame = arcadeApp && arcadeApp.getWalletAddress() && 
                            game.p1.toLowerCase() === arcadeApp.getWalletAddress()!.toLowerCase();
            const timeAgo = Math.floor((Date.now() - game.createdAt) / 1000);
            
            html += `
                <div class="game-card">
                    <div class="game-card-header">
                        <span class="game-id">Game #${game.id}</span>
                        <span class="game-status">Open</span>
                    </div>
                    <div class="game-card-body">
                        <div>Creator: ${game.p1Name}</div>
                        <div>Stake: ${game.stake} ETH</div>
                        <div style="font-size: 0.75rem; color: #888;">Created ${timeAgo}s ago</div>
                    </div>
                    <div class="game-card-actions">
                        ${isOwnGame ? 
                            '<button class="btn-secondary" disabled>Your Game</button>' : 
                            `<button class="btn-primary" onclick="joinGame(${game.id})">Join Game</button>`
                        }
                    </div>
                </div>
            `;
        }
        listElement.innerHTML = html;
    }
}

function loadMyGames(): void {
    const listElement = document.getElementById('my-games-list');
    if (!listElement) return;
    
    if (!arcadeApp || !arcadeApp.getWalletAddress()) {
        listElement.innerHTML = '<p class="loading-text">Please connect wallet to view your games</p>';
        return;
    }
    
    if (DEMO_MODE) {
        const myGames = demoGames.filter(g => 
            (g.p1 && g.p1.toLowerCase() === arcadeApp.getWalletAddress()!.toLowerCase()) ||
            (g.p2 && g.p2.toLowerCase() === arcadeApp.getWalletAddress()!.toLowerCase())
        );
        
        if (myGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No games yet. Create or join one!</p>';
            return;
        }
        
        let html = '';
        for (const game of myGames) {
            const isP1 = game.p1.toLowerCase() === arcadeApp.getWalletAddress()!.toLowerCase();
            const opponent = isP1 ? (game.p2Name || 'Waiting...') : game.p1Name;
            const myChoice = isP1 ? game.p1Choice : game.p2Choice;
            
            let statusText = '';
            
            if (game.state === GameState.Open) {
                statusText = '<span class="game-status">Waiting for opponent</span>';
            } else if (game.state === GameState.Filled) {
                statusText = '<span class="game-status">Revealing...</span>';
            } else if (game.state === GameState.Settled) {
                const won = game.winner && game.winner.toLowerCase() === arcadeApp.getWalletAddress()!.toLowerCase();
                statusText = `<span class="game-status ${won ? 'won' : 'lost'}">${won ? '🎉 You Won!' : '😔 You Lost'}</span>`;
            }
            
            html += `
                <div class="game-card">
                    <div class="game-card-header">
                        <span class="game-id">Game #${game.id}</span>
                        ${statusText}
                    </div>
                    <div class="game-card-body">
                        <div>Opponent: ${opponent}</div>
                        <div>Your Choice: ${myChoice}</div>
                        <div>Stake: ${game.stake} ETH</div>
                        ${game.state === GameState.Settled ? `<div>Pot: ${game.pot} ETH</div>` : ''}
                    </div>
                </div>
            `;
        }
        listElement.innerHTML = html;
    }
}

// Make functions available globally
(window as any).openCoinTossModal = openCoinTossModal;
(window as any).closeCoinTossModal = closeCoinTossModal;
(window as any).openConnect4Modal = openConnect4Modal;
(window as any).closeConnect4Modal = closeConnect4Modal;
(window as any).openWarModal = openWarModal;
(window as any).closeWarModal = closeWarModal;
(window as any).openRPSModal = openRPSModal;
(window as any).closeRPSModal = closeRPSModal;
(window as any).switchCoinTossTab = switchCoinTossTab;

// Auto-refresh games list
setInterval(() => {
    if (DEMO_MODE) {
        const modal = document.getElementById('coin-toss-modal');
        if (modal && modal.style.display === 'flex') {
            refreshGamesList();
        }
    }
}, 5000);

// Close modals on outside click
window.onclick = function(event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal')) {
        if (target.id === 'coin-toss-modal') closeCoinTossModal();
        if (target.id === 'connect4-modal') closeConnect4Modal();
        if (target.id === 'war-modal') closeWarModal();
        if (target.id === 'rps-modal') closeRPSModal();
    }
};

console.log('🎮 Basement Arcade 3D loaded successfully!');

