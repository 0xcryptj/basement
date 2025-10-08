// Arcade App - Read-only wallet display (connects on homepage only)
class ArcadeApp {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.profilePic = null;
        this.coinTossContract = null;
        this.provider = null;
        this.signer = null;
        this.init();
    }

    async init() {
        // Read wallet session from localStorage (set on homepage)
        this.loadWalletSession();
        
        // Update UI to show wallet status
        this.updateWalletUI();
        
        // Initialize contract if connected
        if (this.isConnected) {
            await this.initializeContract();
        }
        
        // Setup disconnect button
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
        
        // Listen for storage changes (if homepage disconnects)
        window.addEventListener('storage', (e) => {
            if (e.key === 'basement_walletAddress' || e.key === 'basement_isConnected') {
                this.loadWalletSession();
                this.updateWalletUI();
            }
        });
        
        // Start demo mode bots if enabled
        if (DEMO_MODE) {
            initDemoMode();
        }
    }

    disconnectWallet() {
        // Clear all session data
        localStorage.removeItem('basement_walletAddress');
        localStorage.removeItem('basement_username');
        localStorage.removeItem('basement_profilePic');
        localStorage.removeItem('basement_isConnected');
        
        // Redirect to homepage
        window.location.href = '../index.html';
    }

    loadWalletSession() {
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

    updateWalletUI() {
        const walletConnectedDisplay = document.getElementById('wallet-connected-display');
        const walletNotConnected = document.getElementById('wallet-not-connected');
        const walletAddress = document.getElementById('wallet-address');
        
        if (this.isConnected) {
            // Show connected wallet display
            if (walletConnectedDisplay) walletConnectedDisplay.style.display = 'flex';
            if (walletNotConnected) walletNotConnected.style.display = 'none';
            
            // Update wallet address display
            if (walletAddress) {
                const displayText = this.username || this.walletAddress;
                walletAddress.innerHTML = `<span class="wallet-display">${displayText}</span>`;
            }
            
            this.updateProfilePic();
        } else {
            // Show not connected message
            if (walletConnectedDisplay) walletConnectedDisplay.style.display = 'none';
            if (walletNotConnected) walletNotConnected.style.display = 'block';
        }
    }

    updateProfilePic() {
        const profilePic = document.getElementById('profile-pic');
        const profilePicPlaceholder = document.getElementById('profile-pic-placeholder');
        
        if (this.profilePic) {
            if (profilePic) {
                profilePic.src = this.profilePic;
                profilePic.style.display = 'block';
            }
            if (profilePicPlaceholder) profilePicPlaceholder.style.display = 'none';
        } else {
            if (profilePic) {
                profilePic.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDUyZmY5OSIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiNmZmZmZmYiLz4KICA8cGF0aCBkPSJNMTAgMzBDMTAgMjUgMTMgMjAgMjAgMjBTMzAgMjUgMzAgMzBWMzVIMTBWMzBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
                profilePic.style.display = 'block';
            }
            if (profilePicPlaceholder) profilePicPlaceholder.style.display = 'none';
        }
    }

    async initializeContract() {
        if (COIN_TOSS_ADDRESS !== "0x0000000000000000000000000000000000000000") {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    this.provider = new ethers.BrowserProvider(window.ethereum);
                    this.signer = await this.provider.getSigner();
                    this.coinTossContract = new ethers.Contract(COIN_TOSS_ADDRESS, COIN_TOSS_ABI, this.signer);
                    setupContractListeners();
                    console.log('✅ Contract initialized');
                }
            } catch (error) {
                console.error('❌ Failed to initialize contract:', error);
            }
        }
    }
}

// Demo Mode Configuration
let DEMO_MODE = true; // Toggleable in UI
let demoGames = [];
let demoGameIdCounter = 0;
let botInterval = null;

// Bot names for demo
const BOT_NAMES = [
    'CryptoWhale', 'DiamondHands', 'MoonBoy', 'BasedDev', 'DeFiKing',
    'NFTCollector', 'GasGuzzler', 'SmartContract', 'TokenMaster', 'BlockChainBro'
];

// Contract details - UPDATE AFTER DEPLOYMENT
const COIN_TOSS_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update after deployment
const COIN_TOSS_ABI = [
    "function createGame(bytes32 commit) external payable returns (uint256 id)",
    "function joinGame(uint256 id, bytes32 commit) external payable",
    "function reveal(uint256 id, uint8 choice, bytes32 salt) external",
    "function requiredWithFee(uint256 stake) public pure returns (uint256)",
    "function games(uint256) public view returns (address p1, address p2, uint256 stake, uint256 pot, bytes32 p1Commit, bytes32 p2Commit, uint8 p1Reveal, uint8 p2Reveal, uint64 createdAt, uint64 filledAt, uint64 revealDeadline, uint8 state)",
    "function nextId() public view returns (uint256)",
    "function REVEAL_WINDOW() public view returns (uint256)",
    "event GameCreated(uint256 id, address creator, uint256 stake)",
    "event GameJoined(uint256 id, address joiner)",
    "event Revealed(uint256 id, address player, uint8 choice)",
    "event Settled(uint256 id, address winner, uint256 payout, uint256 houseCut)"
];

// State management
let selectedCreateChoice = null;
let selectedJoinChoice = null;
let currentJoinGameId = null;
let refreshInterval = null;

// Sound Effects Manager
const SOUNDS = {
    win: new Audio('../assets/win.mp3'),
    loss: new Audio('../assets/loss.mp3'),
    flipcard: new Audio('../assets/flipcard.mp3'),
    c4drop: new Audio('../assets/c4.mp3'),
    cointoss: new Audio('../assets/cointoss.mp3')
};

// Preload sounds
Object.values(SOUNDS).forEach(sound => {
    sound.volume = 0.5; // Set default volume
    sound.load();
});

function playSound(soundName) {
    if (SOUNDS[soundName]) {
        SOUNDS[soundName].currentTime = 0; // Reset to start
        SOUNDS[soundName].play().catch(err => console.log('Sound play failed:', err));
    }
}

// Initialize app
let arcadeApp;
document.addEventListener('DOMContentLoaded', () => {
    arcadeApp = new ArcadeApp();
    
    // Setup demo mode toggle
    const demoToggle = document.getElementById('demo-mode-toggle');
    if (demoToggle) {
        demoToggle.checked = DEMO_MODE;
        demoToggle.addEventListener('change', (e) => {
            DEMO_MODE = e.target.checked;
            console.log(`Demo Mode: ${DEMO_MODE ? 'ON' : 'OFF'}`);
            
            if (DEMO_MODE) {
                initDemoMode();
            } else {
                stopBotActivity();
            }
            
            // Refresh all game lists
            refreshGamesList();
        });
    }
    
    // Setup mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
            }
        });
    }
});

// ========== DEMO MODE FUNCTIONS ==========

function initDemoMode() {
    console.log('🤖 Demo Mode Active - Bots will create and play games');
    
    // Load demo games from localStorage
    const savedGames = localStorage.getItem('basement_demo_games');
    if (savedGames) {
        demoGames = JSON.parse(savedGames);
        demoGameIdCounter = demoGames.length;
    } else {
        // Create initial demo games
        createInitialDemoGames();
    }
    
    // Start bot activity
    startBotActivity();
}

function createInitialDemoGames() {
    // Create 3-5 initial demo games
    const initialGames = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < initialGames; i++) {
        const stake = (Math.random() * 0.09 + 0.01).toFixed(3); // 0.01 to 0.1 ETH
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
            state: 0, // Open
            p1Choice: Math.random() > 0.5 ? 'Heads' : 'Tails',
            p2Choice: null,
            winner: null,
            createdAt: Date.now() - Math.random() * 300000 // Created within last 5 mins
        });
    }
    
    saveDemoGames();
}

function startBotActivity() {
    // Clear any existing interval
    if (botInterval) clearInterval(botInterval);
    
    // Bots perform actions every 10-30 seconds
    botInterval = setInterval(() => {
        const action = Math.random();
        
        if (action < 0.3) {
            // 30% chance: Create new game
            botCreateGame();
        } else if (action < 0.7) {
            // 40% chance: Join existing game
            botJoinGame();
        } else {
            // 30% chance: Reveal and settle
            botRevealGame();
        }
        
        // Refresh UI
        refreshGamesList();
    }, 15000 + Math.random() * 15000); // 15-30 seconds
}

function stopBotActivity() {
    if (botInterval) {
        clearInterval(botInterval);
        botInterval = null;
        console.log('🛑 Bot activity stopped');
    }
}

function botCreateGame() {
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
        state: 0, // Open
        p1Choice: Math.random() > 0.5 ? 'Heads' : 'Tails',
        p2Choice: null,
        winner: null,
        createdAt: Date.now()
    });
    
    saveDemoGames();
    console.log(`🤖 ${botName} created game #${demoGameIdCounter - 1} with ${stake} ETH`);
}

function botJoinGame() {
    const openGames = demoGames.filter(g => g.state === 0);
    if (openGames.length === 0) return;
    
    const game = openGames[Math.floor(Math.random() * openGames.length)];
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const botAddress = generateBotAddress();
    
    game.p2 = botAddress;
    game.p2Name = botName;
    game.p2Choice = Math.random() > 0.5 ? 'Heads' : 'Tails';
    game.state = 1; // Filled
    game.pot = (parseFloat(game.stake) * 2).toFixed(3);
    game.filledAt = Date.now();
    
    saveDemoGames();
    console.log(`🤖 ${botName} joined game #${game.id}`);
    
    // Auto-reveal after 3-5 seconds
    setTimeout(() => {
        botRevealSpecificGame(game.id);
    }, 3000 + Math.random() * 2000);
}

function botRevealGame() {
    const filledGames = demoGames.filter(g => g.state === 1);
    if (filledGames.length === 0) return;
    
    const game = filledGames[Math.floor(Math.random() * filledGames.length)];
    botRevealSpecificGame(game.id);
}

function botRevealSpecificGame(gameId) {
    const game = demoGames.find(g => g.id === gameId);
    if (!game || game.state !== 1) return;
    
    // Don't play sound for bot games - only for user games
    
    // Determine winner
    if (game.p1Choice === game.p2Choice) {
        // Same choice - random winner
        game.winner = Math.random() > 0.5 ? game.p1 : game.p2;
    } else {
        // Different choices - p1 wins if both chose Heads, p2 wins otherwise
        game.winner = Math.random() > 0.5 ? game.p1 : game.p2;
    }
    
    game.state = 3; // Settled
    saveDemoGames();
    console.log(`🎉 Game #${game.id} settled! Winner: ${game.winner === game.p1 ? game.p1Name : game.p2Name}`);
    
    // Remove settled games after 10 seconds (reduced from 30)
    setTimeout(() => {
        demoGames = demoGames.filter(g => g.id !== gameId);
        saveDemoGames();
        refreshGamesList();
    }, 10000);
}

function generateBotAddress() {
    return '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

function saveDemoGames() {
    localStorage.setItem('basement_demo_games', JSON.stringify(demoGames));
}

// User actions in demo mode
// Confetti Animation
function createConfetti() {
    const colors = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff', '#ff0000', '#0052ff'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function showCoinFlipAnimation(game) {
    const existingAnimation = document.getElementById('coin-flip-animation');
    if (existingAnimation) existingAnimation.remove();
    
    const animationDiv = document.createElement('div');
    animationDiv.id = 'coin-flip-animation';
    animationDiv.innerHTML = `
        <div class="coin-flip-fullscreen">
            <div class="coin-3d-container">
                <div class="coin-3d flipping">
                    <div class="coin-side front">
                        <img src="../assets/heads.png" alt="Heads">
                    </div>
                    <div class="coin-side back">
                        <img src="../assets/tails.png" alt="Tails">
                    </div>
                </div>
            </div>
            <div class="flip-status">FLIPPING COIN...</div>
        </div>
    `;
    document.body.appendChild(animationDiv);
}

function revealCoinTossResult(game) {
    // Determine winner
    if (game.p1Choice === game.p2Choice) {
        game.winner = Math.random() > 0.5 ? game.p1 : game.p2;
    } else {
        game.winner = Math.random() > 0.5 ? game.p1 : game.p2;
    }
    
    game.state = 3;
    saveDemoGames();
    
    const animationDiv = document.getElementById('coin-flip-animation');
    const video = document.getElementById('coin-flip-video');
    
    if (animationDiv) {
        const isUserWinner = game.winner === game.p2;
        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        
        // Stop video and show result with image
        setTimeout(() => {
            if (video) {
                video.pause();
                video.style.display = 'none';
            }
            
            animationDiv.innerHTML = `
                <div class="coin-flip-fullscreen">
                    <div class="coin-result-container">
                        <img src="../assets/${result}.png" class="coin-result-image landed" alt="${result}">
                    </div>
                    <div class="flip-status result">It's ${result.toUpperCase()}!</div>
                    <div class="flip-result ${isUserWinner ? 'victory' : 'defeat'}">
                        ${isUserWinner ? '🎉 YOU WON!' : '😔 YOU LOST!'}
                    </div>
                    <div class="flip-result-sub">
                        ${isUserWinner ? `You won ${game.pot} ETH!` : 'Better luck next time!'}
                    </div>
                </div>
            `;
            
            if (isUserWinner) {
                playSound('win');
                createConfetti();
            } else {
                playSound('loss');
            }
            
            setTimeout(() => {
                if (animationDiv) animationDiv.remove();
            }, 4000);
        }, 2000);
    }
}

function demoCreateGame(stake, choice) {
    const userAddress = arcadeApp.walletAddress || generateBotAddress();
    const userName = arcadeApp.username || 'You';
    
    demoGames.push({
        id: demoGameIdCounter++,
        p1: userAddress,
        p1Name: userName,
        p2: null,
        p2Name: null,
        stake: stake,
        pot: stake,
        state: 0, // Open
        p1Choice: choice,
        p2Choice: null,
        winner: null,
        createdAt: Date.now()
    });
    
    saveDemoGames();
    showStatus('create-status', `Demo: Game #${demoGameIdCounter - 1} created! Bots will join soon.`, 'success');
    
    // Bot joins after 2-3 seconds
    setTimeout(() => {
        const game = demoGames.find(g => g.id === demoGameIdCounter - 1);
        if (game && game.state === 0) {
            botJoinGame();
            refreshGamesList();
        }
    }, 2000 + Math.random() * 1000);
}

function demoJoinGame(gameId, choice) {
    const game = demoGames.find(g => g.id === gameId);
    if (!game || game.state !== 0) {
        showStatus('join-status', 'Game not available', 'error');
        return;
    }
    
    const userAddress = arcadeApp.walletAddress || generateBotAddress();
    const userName = arcadeApp.username || 'You';
    
    game.p2 = userAddress;
    game.p2Name = userName;
    game.p2Choice = choice;
    game.state = 1; // Filled
    game.pot = (parseFloat(game.stake) * 2).toFixed(3);
    game.filledAt = Date.now();
    
    saveDemoGames();
    
    // Play coin toss sound for user games
    playSound('cointoss');
    
    // Show animated coin flip
    showCoinFlipAnimation(game);
    
    // Auto-reveal immediately
    setTimeout(() => {
        revealCoinTossResult(game);
        refreshGamesList();
    }, 2000);
}

// ========== END DEMO MODE FUNCTIONS ==========

// Contract Event Listeners
function setupContractListeners() {
    const coinTossContract = arcadeApp.coinTossContract;
    if (!coinTossContract) return;
    
    // Listen for game created
    coinTossContract.on("GameCreated", (id, creator, stake) => {
        console.log(`Game ${id} created by ${creator} with stake ${ethers.formatEther(stake)} ETH`);
        if (arcadeApp.walletAddress && creator.toLowerCase() === arcadeApp.walletAddress.toLowerCase()) {
            showStatus('create-status', `Game #${id} created successfully!`, 'success');
        }
        refreshGamesList();
    });
    
    // Listen for game joined
    coinTossContract.on("GameJoined", (id, joiner) => {
        console.log(`Game ${id} joined by ${joiner}`);
        if (arcadeApp.walletAddress && joiner.toLowerCase() === arcadeApp.walletAddress.toLowerCase()) {
            showStatus('join-status', `Joined game #${id} successfully!`, 'success');
        }
        refreshGamesList();
    });
    
    // Listen for reveals
    coinTossContract.on("Revealed", (id, player, choice) => {
        console.log(`Game ${id} - ${player} revealed ${choice === 0 ? 'Heads' : 'Tails'}`);
        refreshGamesList();
    });
    
    // Listen for game settled
    coinTossContract.on("Settled", (id, winner, payout) => {
        console.log(`Game ${id} settled! Winner: ${winner}, Payout: ${ethers.formatEther(payout)} ETH`);
        alert(`🎉 Game ${id} settled! Winner: ${winner.slice(0, 10)}...`);
        refreshGamesList();
    });
}

// ========== COIN TOSS GAME FUNCTIONS ==========

// Modal Controls
function openCoinTossModal() {
    document.getElementById('coin-toss-modal').style.display = 'flex';
    switchTab('create');
    loadOpenGames();
}

function closeCoinTossModal() {
    document.getElementById('coin-toss-modal').style.display = 'none';
}

function switchTab(tab) {
    // Hide all tabs
    document.querySelectorAll('#coin-toss-modal .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#coin-toss-modal .tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    if (tab === 'create') {
        document.getElementById('create-tab').classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[0].classList.add('active');
    } else if (tab === 'join') {
        document.getElementById('join-tab').classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[1].classList.add('active');
        loadOpenGames();
    } else if (tab === 'my-games') {
        document.getElementById('my-games-tab').classList.add('active');
        document.querySelectorAll('#coin-toss-modal .tab-btn')[2].classList.add('active');
        loadMyGames();
    }
}

// Choice Selection
function selectChoice(button, type) {
    const choice = button.getAttribute('data-choice') === '0' ? 'Heads' : 'Tails';
    
    if (type === 'create') {
    selectedCreateChoice = choice;
        document.querySelectorAll('#create-tab .choice-btn').forEach(btn => btn.classList.remove('selected'));
    } else if (type === 'join') {
        selectedJoinChoice = choice;
        document.querySelectorAll('#join-game-modal .choice-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    button.classList.add('selected');
}

// Create Game
async function createGame() {
    const stakeInput = document.getElementById('create-stake');
    const stake = stakeInput.value;
    
    if (!stake || parseFloat(stake) <= 0) {
        showStatus('create-status', 'Please enter a valid stake amount', 'error');
        return;
    }
    
    if (!selectedCreateChoice) {
        showStatus('create-status', 'Please select Heads or Tails', 'error');
        return;
    }
    
    // Demo mode
    if (DEMO_MODE) {
        demoCreateGame(stake, selectedCreateChoice);
        stakeInput.value = '';
        selectedCreateChoice = null;
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        refreshGamesList();
        return;
    }
    
    // Real contract mode
    if (!arcadeApp.coinTossContract) {
        showStatus('create-status', 'Contract not deployed. Using demo mode.', 'error');
        return;
    }
    
    try {
        showStatus('create-status', 'Creating game...', 'info');
        
        const choice = selectedCreateChoice === 'Heads' ? 0 : 1;
        const salt = ethers.hexlify(ethers.randomBytes(32));
        const commit = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint8", "bytes32"],
                [choice, salt]
            )
        );
        
        const stakeWei = ethers.parseEther(stake);
        const required = await arcadeApp.coinTossContract.requiredWithFee(stakeWei);
        
        const tx = await arcadeApp.coinTossContract.createGame(commit, { value: required });
        const receipt = await tx.wait();
        
        const event = receipt.logs.find(l => l.fragment?.name === 'GameCreated');
        const gameId = event?.args?.id?.toString();
        
        if (gameId) {
            localStorage.setItem(`salt-${gameId}`, salt);
            localStorage.setItem(`choice-${gameId}`, choice.toString());
            showStatus('create-status', `Game #${gameId} created!`, 'success');
        }
        
        stakeInput.value = '';
        selectedCreateChoice = null;
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        
        setTimeout(() => {
            switchTab('my-games');
        }, 2000);
        
    } catch (error) {
        console.error('Create game error:', error);
        showStatus('create-status', `Error: ${error.message}`, 'error');
    }
}

// Join Game
function joinGame(gameId) {
    currentJoinGameId = gameId;
    
    // Show choice selection
    const joinTab = document.getElementById('join-tab');
    const choiceSection = document.getElementById('join-choice-section');
    
    if (!choiceSection) {
        const html = `
            <div id="join-choice-section" class="choice-section">
                <h3>Select Your Choice:</h3>
                <div id="join-choice-buttons" class="choice-buttons">
                    <button class="choice-btn" onclick="selectJoinChoice('Heads')">🪙 Heads</button>
                    <button class="choice-btn" onclick="selectJoinChoice('Tails')">🪙 Tails</button>
                </div>
                <button class="btn-primary" onclick="confirmJoinGame()">Confirm Join</button>
                <button class="btn-secondary" onclick="cancelJoinGame()">Cancel</button>
            </div>
        `;
        joinTab.insertAdjacentHTML('beforeend', html);
    } else {
        choiceSection.style.display = 'block';
    }
}

async function confirmJoinGame() {
    if (!selectedJoinChoice) {
        alert('Please select Heads or Tails');
        return;
    }
    
    // Demo mode
    if (DEMO_MODE) {
        demoJoinGame(currentJoinGameId, selectedJoinChoice);
        cancelJoinGame();
        return;
    }
    
    // Real contract mode
    if (!arcadeApp.coinTossContract) {
        alert('Contract not deployed. Using demo mode.');
        return;
    }
    
    try {
        showStatus('join-status', 'Joining game...', 'info');
        
        const choice = selectedJoinChoice === 'Heads' ? 0 : 1;
        const salt = ethers.hexlify(ethers.randomBytes(32));
        const commit = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint8", "bytes32"],
                [choice, salt]
            )
        );
        
        const game = await arcadeApp.coinTossContract.games(currentJoinGameId);
        const required = await arcadeApp.coinTossContract.requiredWithFee(game.stake);
        
        const tx = await arcadeApp.coinTossContract.joinGame(currentJoinGameId, commit, { value: required });
        await tx.wait();
        
        localStorage.setItem(`salt-${currentJoinGameId}`, salt);
        localStorage.setItem(`choice-${currentJoinGameId}`, choice.toString());
        
        showStatus('join-status', `Joined game #${currentJoinGameId}!`, 'success');
        cancelJoinGame();
        
        setTimeout(() => {
            switchTab('my-games');
        }, 2000);
        
    } catch (error) {
        console.error('Join game error:', error);
        showStatus('join-status', `Error: ${error.message}`, 'error');
    }
}

function cancelJoinGame() {
    const choiceSection = document.getElementById('join-choice-section');
    if (choiceSection) {
        choiceSection.style.display = 'none';
    }
    selectedJoinChoice = null;
    currentJoinGameId = null;
}

// Reveal Game
async function revealGame(gameId) {
    if (DEMO_MODE) {
        alert('Demo mode: Game will auto-reveal!');
        return;
    }
    
    if (!arcadeApp.coinTossContract) {
        alert('Contract not available');
        return;
    }
    
    try {
        const salt = localStorage.getItem(`salt-${gameId}`);
        const choice = parseInt(localStorage.getItem(`choice-${gameId}`));
        
        if (salt === null || isNaN(choice)) {
            alert('Reveal data not found. Did you create/join this game?');
            return;
        }
        
        showStatus('my-games-status', 'Revealing...', 'info');
        
        const tx = await arcadeApp.coinTossContract.reveal(gameId, choice, salt);
        await tx.wait();
        
        showStatus('my-games-status', 'Revealed successfully!', 'success');
        refreshGamesList();
        
    } catch (error) {
        console.error('Reveal error:', error);
        alert(`Error revealing: ${error.message}`);
    }
}

// List Games
async function loadOpenGames() {
    const listElement = document.getElementById('open-games-list');
    
    // Demo mode
    if (DEMO_MODE) {
        const openGames = demoGames.filter(g => g.state === 0);
        
        if (openGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No open games. Bots will create some soon!</p>';
            return;
        }
        
        let html = '';
        for (const game of openGames) {
            const isOwnGame = arcadeApp.walletAddress && game.p1.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
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
        return;
    }
    
    // Real contract mode
    try {
        if (!arcadeApp.coinTossContract) {
            listElement.innerHTML = '<p class="loading-text">Please connect wallet and deploy contract first.</p>';
            return;
        }
        
        const coinTossContract = arcadeApp.coinTossContract;
        const nextId = await coinTossContract.nextId();
        const openGames = [];
        
        for (let i = 0; i < nextId; i++) {
            const game = await coinTossContract.games(i);
            if (game.state === 0) {
                openGames.push({ id: i, ...game });
            }
        }
        
        if (openGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No open games available. Create one!</p>';
            return;
        }
        
        let html = '';
        for (const game of openGames) {
            const isOwnGame = arcadeApp.walletAddress && game.p1.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
            html += `
                <div class="game-card">
                    <div class="game-card-header">
                        <span class="game-id">Game #${game.id}</span>
                        <span class="game-status">Open</span>
                    </div>
                    <div class="game-card-body">
                        Creator: ${game.p1.slice(0, 10)}...${game.p1.slice(-8)}<br>
                        Stake: ${ethers.formatEther(game.stake)} ETH
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
        
    } catch (error) {
        console.error('Load games error:', error);
        listElement.innerHTML = '<p class="loading-text">Error loading games</p>';
    }
}

async function loadMyGames() {
    const listElement = document.getElementById('my-games-list');
    
    if (!arcadeApp.walletAddress) {
        listElement.innerHTML = '<p class="loading-text">Please connect wallet to view your games</p>';
        return;
    }
    
    // Demo mode
    if (DEMO_MODE) {
        const myGames = demoGames.filter(g => 
            (g.p1 && g.p1.toLowerCase() === arcadeApp.walletAddress.toLowerCase()) ||
            (g.p2 && g.p2.toLowerCase() === arcadeApp.walletAddress.toLowerCase())
        );
        
        if (myGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No games yet. Create or join one!</p>';
            return;
        }
        
        let html = '';
        for (const game of myGames) {
            const isP1 = game.p1.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
            const opponent = isP1 ? (game.p2Name || 'Waiting...') : game.p1Name;
            const myChoice = isP1 ? game.p1Choice : game.p2Choice;
            
            let statusText = '';
            let actionButton = '';
            
            if (game.state === 0) {
                statusText = '<span class="game-status">Waiting for opponent</span>';
            } else if (game.state === 1) {
                statusText = '<span class="game-status">Revealing...</span>';
            } else if (game.state === 3) {
                const won = game.winner.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
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
                        ${game.state === 3 ? `<div>Pot: ${game.pot} ETH</div>` : ''}
                    </div>
                    ${actionButton ? `<div class="game-card-actions">${actionButton}</div>` : ''}
                </div>
            `;
        }
        listElement.innerHTML = html;
        return;
    }
    
    // Real contract mode
    try {
        if (!arcadeApp.coinTossContract) {
            listElement.innerHTML = '<p class="loading-text">Contract not available</p>';
            return;
        }
        
        const coinTossContract = arcadeApp.coinTossContract;
        const nextId = await coinTossContract.nextId();
        const myGames = [];
        
        for (let i = 0; i < nextId; i++) {
            const game = await coinTossContract.games(i);
            const isP1 = game.p1.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
            const isP2 = game.p2 && game.p2.toLowerCase() === arcadeApp.walletAddress.toLowerCase();
            
            if (isP1 || isP2) {
                myGames.push({ id: i, ...game, isP1 });
            }
        }
        
        if (myGames.length === 0) {
            listElement.innerHTML = '<p class="loading-text">No games yet. Create or join one!</p>';
            return;
        }
        
        let html = '';
        for (const game of myGames) {
            const opponent = game.isP1 ? game.p2 : game.p1;
            const myRevealed = game.isP1 ? game.p1Reveal : game.p2Reveal;
            const oppRevealed = game.isP1 ? game.p2Reveal : game.p1Reveal;
            
            let statusText = '';
            let actionButton = '';
            
            if (game.state === 0) {
                statusText = '<span class="game-status">Waiting for opponent</span>';
            } else if (game.state === 1 || game.state === 2) {
                if (myRevealed === 0) {
                    statusText = '<span class="game-status">Need to reveal</span>';
                    actionButton = `<button class="btn-primary" onclick="revealGame(${game.id})">Reveal</button>`;
                } else {
                    statusText = '<span class="game-status">Waiting for opponent reveal</span>';
                }
            } else if (game.state === 3) {
                const won = (game.isP1 && game.p1Reveal - 1 === oppRevealed - 1 && game.p1Reveal === 1) ||
                           (!game.isP1 && game.p2Reveal - 1 !== game.p1Reveal - 1);
                statusText = `<span class="game-status ${won ? 'won' : 'lost'}">${won ? '🎉 You Won!' : '😔 You Lost'}</span>`;
            }
            
            html += `
                <div class="game-card">
                    <div class="game-card-header">
                        <span class="game-id">Game #${game.id}</span>
                        ${statusText}
                    </div>
                    <div class="game-card-body">
                        Opponent: ${opponent ? opponent.slice(0, 10) + '...' : 'None'}<br>
                        Stake: ${ethers.formatEther(game.stake)} ETH<br>
                        ${myRevealed > 0 ? `Your choice: ${myRevealed === 1 ? 'Heads' : 'Tails'}<br>` : ''}
                        ${oppRevealed > 0 ? `Opponent: ${oppRevealed === 1 ? 'Heads' : 'Tails'}` : ''}
                    </div>
                    ${actionButton ? `<div class="game-card-actions">${actionButton}</div>` : ''}
                </div>
            `;
        }
        listElement.innerHTML = html;
        
    } catch (error) {
        console.error('Load my games error:', error);
        listElement.innerHTML = '<p class="loading-text">Error loading your games</p>';
    }
}

function refreshGamesList() {
    loadOpenGames();
    loadMyGames();
}

// Status Messages
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `status-message ${type}`;
        element.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
}

// ========== CONNECT 4 GAME FUNCTIONS ==========
let connect4Games = [];
let connect4GameIdCounter = 0;
let activeConnect4Game = null;

function openConnect4Modal() {
    if (!DEMO_MODE) {
        alert('Connect 4 requires Demo Mode or deployed smart contract. Please enable Demo Mode.');
        return;
    }
    
    document.getElementById('connect4-modal').style.display = 'flex';
    switchConnect4Tab('create');
}

function closeConnect4Modal() {
    document.getElementById('connect4-modal').style.display = 'none';
    activeConnect4Game = null;
}

function switchConnect4Tab(tab) {
    document.querySelectorAll('#connect4-modal .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#connect4-modal .tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'create') {
        document.getElementById('connect4-create-tab').classList.add('active');
        document.querySelectorAll('#connect4-modal .tab-btn')[0].classList.add('active');
    } else if (tab === 'join') {
        document.getElementById('connect4-join-tab').classList.add('active');
        document.querySelectorAll('#connect4-modal .tab-btn')[1].classList.add('active');
        loadConnect4Games();
    } else if (tab === 'my-games') {
        document.getElementById('connect4-my-games-tab').classList.add('active');
        document.querySelectorAll('#connect4-modal .tab-btn')[2].classList.add('active');
        loadMyConnect4Games();
    }
}

function createConnect4Game() {
    if (!DEMO_MODE) {
        alert('Demo mode required');
        return;
    }
    
    const stakeInput = document.getElementById('connect4-stake');
    const stake = parseFloat(stakeInput.value) || 0.01;
    
    const userAddress = arcadeApp.walletAddress || generateBotAddress();
    const userName = arcadeApp.username || 'You';
    
    // Create game vs CPU
    const gameId = connect4GameIdCounter++;
    const cpuName = 'CPU Player';
    
    const game = {
        id: gameId,
        p1: userAddress,
        p1Name: userName,
        p2: 'CPU',
        p2Name: cpuName,
        stake: stake.toFixed(3),
        pot: (stake * 2).toFixed(3),
        state: 1, // Active
        board: Array(6).fill(null).map(() => Array(7).fill(0)),
        currentPlayer: 1, // 1 = user (red), 2 = CPU (yellow)
        winner: null,
        createdAt: Date.now()
    };
    
    connect4Games.push(game);
    activeConnect4Game = game;
    
    showStatus('connect4-create-status', `Game #${gameId} created! You start first (RED).`, 'success');
    
    // Launch game board
    setTimeout(() => {
        closeConnect4Modal();
        launchConnect4Board(game);
    }, 1500);
}

function launchConnect4Board(game) {
    // Create game board overlay
    const overlay = document.createElement('div');
    overlay.id = 'connect4-game-overlay';
    overlay.innerHTML = `
        <div class="game-board-container">
            <div class="game-board-header">
                <h3 class="neon">Connect 4 - Game #${game.id}</h3>
                <div class="game-players">
                    <span class="player-indicator p1">🔴 ${game.p1Name}</span>
                    <span class="vs">VS</span>
                    <span class="player-indicator p2">🟡 ${game.p2Name}</span>
                </div>
                <div id="connect4-turn" class="turn-indicator">🔴 Your Turn</div>
                <button onclick="closeConnect4Game()" class="close-game-btn">Exit Game</button>
            </div>
            <div id="connect4-board" class="connect4-board">
                ${generateConnect4BoardHTML(game.board)}
            </div>
            <div id="connect4-game-status" class="game-status-msg"></div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add click handlers to columns
    document.querySelectorAll('.connect4-column').forEach((col, index) => {
        col.addEventListener('click', () => makeConnect4Move(game, index));
    });
}

function generateConnect4BoardHTML(board) {
    let html = '<div class="connect4-grid">';
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = board[row][col];
            let cellClass = 'connect4-cell';
            let cellContent = '⚪';
            
            if (cell === 1) {
                cellClass += ' player1';
                cellContent = '🔴';
            } else if (cell === 2) {
                cellClass += ' player2';
                cellContent = '🟡';
            }
            
            html += `<div class="${cellClass}" data-row="${row}" data-col="${col}">${cellContent}</div>`;
        }
    }
    
    // Column click indicators
    html += '</div><div class="connect4-columns">';
    for (let i = 0; i < 7; i++) {
        html += `<div class="connect4-column" data-col="${i}">▼</div>`;
    }
    html += '</div>';
    
    return html;
}

function makeConnect4Move(game, col) {
    if (game.currentPlayer !== 1 || game.winner) return;
    
    // Find lowest empty row in column
    let row = -1;
    for (let r = 5; r >= 0; r--) {
        if (game.board[r][col] === 0) {
            row = r;
            break;
        }
    }
    
    if (row === -1) {
        showConnect4Status('Column full!', 'error');
        return;
    }
    
    // Make move
    game.board[row][col] = 1;
    game.currentPlayer = 2;
    
    // Play sound and update board together
    playSound('c4drop');
    updateConnect4Board(game, row, col);
    
    // Check win
    const winningCells = checkConnect4Win(game.board, 1);
    if (winningCells) {
        highlightWinningCells(winningCells);
        endConnect4Game(game, 1);
        return;
    }
    
    // Check draw
    if (checkConnect4Draw(game.board)) {
        endConnect4Game(game, 0);
        return;
    }
    
    // CPU turn with slight delay
    setTimeout(() => cpuConnect4Move(game), 300);
}

function cpuConnect4Move(game) {
    if (game.winner) return;
    
    showConnect4Status('CPU thinking...', 'info');
    
    // Simple AI: Try to win, block player, or random
    let col = findConnect4WinningMove(game.board, 2);
    if (col === -1) col = findConnect4WinningMove(game.board, 1);
    if (col === -1) col = findRandomConnect4Column(game.board);
    
    if (col === -1) {
        endConnect4Game(game, 0);
        return;
    }
    
    // Find row
    let row = -1;
    for (let r = 5; r >= 0; r--) {
        if (game.board[r][col] === 0) {
            row = r;
            break;
        }
    }
    
    game.board[row][col] = 2;
    game.currentPlayer = 1;
    
    // Play sound and update board together - NO DOUBLE SOUND
    playSound('c4drop');
    updateConnect4Board(game, row, col);
    
    const winningCells = checkConnect4Win(game.board, 2);
    if (winningCells) {
        highlightWinningCells(winningCells);
        endConnect4Game(game, 2);
    } else if (checkConnect4Draw(game.board)) {
        endConnect4Game(game, 0);
    } else {
        showConnect4Status('Your turn!', 'info');
    }
}

function findConnect4WinningMove(board, player) {
    for (let col = 0; col < 7; col++) {
        let row = -1;
        for (let r = 5; r >= 0; r--) {
            if (board[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        if (row !== -1) {
            board[row][col] = player;
            const winningCells = checkConnect4Win(board, player);
            board[row][col] = 0;
            if (winningCells) return col;
        }
    }
    return -1;
}

function findRandomConnect4Column(board) {
    const available = [];
    for (let col = 0; col < 7; col++) {
        if (board[0][col] === 0) available.push(col);
    }
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
}

function highlightWinningCells(winningCells) {
    // Add winner-chip class to winning cells for extra pulse effect
    winningCells.forEach(([row, col]) => {
        const cell = document.querySelector(`.connect4-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('winner-chip');
        }
    });
}

function checkConnect4Win(board, player) {
    // Check horizontal
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === player && board[r][c+1] === player && 
                board[r][c+2] === player && board[r][c+3] === player) {
                return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
            }
        }
    }
    
    // Check vertical
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
            if (board[r][c] === player && board[r+1][c] === player && 
                board[r+2][c] === player && board[r+3][c] === player) {
                return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
            }
        }
    }
    
    // Check diagonal /
    for (let r = 3; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === player && board[r-1][c+1] === player && 
                board[r-2][c+2] === player && board[r-3][c+3] === player) {
                return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
            }
        }
    }
    
    // Check diagonal \
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === player && board[r+1][c+1] === player && 
                board[r+2][c+2] === player && board[r+3][c+3] === player) {
                return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
            }
        }
    }
    
    return false;
}

function checkConnect4Draw(board) {
    return board[0].every(cell => cell !== 0);
}

function updateConnect4Board(game, animateRow = -1, animateCol = -1) {
    const boardElement = document.getElementById('connect4-board');
    if (boardElement) {
        boardElement.innerHTML = generateConnect4BoardHTML(game.board);
        
        // Add dropping animation to the newly placed piece
        if (animateRow >= 0 && animateCol >= 0) {
            setTimeout(() => {
                const cell = document.querySelector(`.connect4-cell[data-row="${animateRow}"][data-col="${animateCol}"]`);
                if (cell) {
                    cell.classList.add('dropping');
                    setTimeout(() => cell.classList.remove('dropping'), 500);
                }
            }, 10);
        }
        
        // Re-add click handlers
        document.querySelectorAll('.connect4-column').forEach((col, index) => {
            col.addEventListener('click', () => makeConnect4Move(game, index));
        });
    }
    
    const turnIndicator = document.getElementById('connect4-turn');
    if (turnIndicator && !game.winner) {
        turnIndicator.textContent = game.currentPlayer === 1 ? '🔴 Your Turn' : '🟡 CPU Turn';
    }
}

function showConnect4Status(message, type) {
    const statusElement = document.getElementById('connect4-game-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `game-status-msg ${type}`;
    }
}

function endConnect4Game(game, winner) {
    game.winner = winner;
    game.state = 3; // Completed
    
    const turnIndicator = document.getElementById('connect4-turn');
    if (turnIndicator) {
        if (winner === 1) {
            playSound('win');
            createConfetti();
            turnIndicator.textContent = '🎉 YOU WON!';
            turnIndicator.style.color = '#00ff00';
            turnIndicator.classList.add('victory');
            showConnect4Status(`You won ${game.pot} ETH!`, 'success');
        } else if (winner === 2) {
            playSound('loss');
            turnIndicator.textContent = '😔 YOU LOST!';
            turnIndicator.style.color = '#ff0000';
            turnIndicator.classList.add('defeat');
            showConnect4Status('Better luck next time!', 'error');
        } else {
            turnIndicator.textContent = '🤝 DRAW!';
            turnIndicator.style.color = '#ffaa00';
            showConnect4Status('It\'s a draw! Stake returned.', 'info');
        }
    }
}

function closeConnect4Game() {
    const overlay = document.getElementById('connect4-game-overlay');
    if (overlay) overlay.remove();
    activeConnect4Game = null;
}

function loadConnect4Games() {
    const listElement = document.getElementById('connect4-games-list');
    listElement.innerHTML = '<p class="loading-text">Demo mode: Click Create Game to play vs CPU!</p>';
}

function loadMyConnect4Games() {
    const listElement = document.getElementById('connect4-my-games-list');
    listElement.innerHTML = '<p class="loading-text">Create games to see your history here.</p>';
}

// ========== WAR CARD GAME FUNCTIONS ==========
let activeWarGame = null;

const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_SUITS = ['♠', '♣', '♥', '♦'];

function openWarModal() {
    if (!DEMO_MODE) {
        alert('War requires Demo Mode or deployed smart contract. Please enable Demo Mode.');
        return;
    }
    
    document.getElementById('war-modal').style.display = 'flex';
    switchWarTab('create');
}

function closeWarModal() {
    document.getElementById('war-modal').style.display = 'none';
}

function switchWarTab(tab) {
    document.querySelectorAll('#war-modal .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#war-modal .tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'create') {
        document.getElementById('war-create-tab').classList.add('active');
        document.querySelectorAll('#war-modal .tab-btn')[0].classList.add('active');
    } else if (tab === 'join') {
        document.getElementById('war-join-tab').classList.add('active');
        document.querySelectorAll('#war-modal .tab-btn')[1].classList.add('active');
        loadWarGames();
    } else if (tab === 'my-games') {
        document.getElementById('war-my-games-tab').classList.add('active');
        document.querySelectorAll('#war-modal .tab-btn')[2].classList.add('active');
        loadMyWarGames();
    }
}

function createWarGame() {
    if (!DEMO_MODE) {
        alert('Demo mode required');
        return;
    }
    
    const stakeInput = document.getElementById('war-stake');
    const stake = parseFloat(stakeInput.value) || 0.01;
    
    const userAddress = arcadeApp.walletAddress || generateBotAddress();
    const userName = arcadeApp.username || 'You';
    
    // Create game vs CPU
    const game = {
        stake: stake.toFixed(3),
        pot: (stake * 2).toFixed(3),
        player: { name: userName, score: 0, card: null },
        cpu: { name: 'CPU Player', score: 0, card: null },
        round: 0,
        maxRounds: 10,
        winner: null
    };
    
    activeWarGame = game;
    
    showStatus('war-create-status', 'Game created! Get ready to battle!', 'success');
    
    setTimeout(() => {
        closeWarModal();
        launchWarBoard(game);
    }, 1000);
}

function launchWarBoard(game) {
    const overlay = document.createElement('div');
    overlay.id = 'war-game-overlay';
    overlay.innerHTML = `
        <div class="game-board-container">
            <div class="game-board-header">
                <h3 class="neon">War - Card Battle</h3>
                <div class="game-players">
                    <span class="player-indicator p1">👤 ${game.player.name}</span>
                    <span class="vs">VS</span>
                    <span class="player-indicator p2">🤖 ${game.cpu.name}</span>
                </div>
                <div class="rps-score">
                    <div class="rps-score-item">You: <span id="war-player-score">0</span></div>
                    <div class="rps-score-item">Round: <span id="war-round">0</span>/${game.maxRounds}</div>
                    <div class="rps-score-item">CPU: <span id="war-cpu-score">0</span></div>
                </div>
                <button onclick="closeWarGame()" class="close-game-btn">Exit Game</button>
            </div>
            <div class="war-board">
                <div id="war-status" class="turn-indicator">Click 'Draw Cards' to start!</div>
                <div class="war-cards">
                    <div id="player-card" class="war-card">
                        <div class="war-card-value">?</div>
                        <div class="war-card-suit"></div>
                    </div>
                    <div class="war-vs">VS</div>
                    <div id="cpu-card" class="war-card">
                        <div class="war-card-value">?</div>
                        <div class="war-card-suit"></div>
                    </div>
                </div>
                <button id="war-draw-btn" class="war-flip-btn" onclick="warDrawCards()">Draw Cards</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function warDrawCards() {
    if (activeWarGame.round >= activeWarGame.maxRounds) {
        endWarGame();
        return;
    }
    
    document.getElementById('war-draw-btn').disabled = true;
    document.getElementById('war-status').textContent = 'Drawing cards...';
    
    // Draw random cards
    const playerCard = {
        value: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
        suit: CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
    };
    
    const cpuCard = {
        value: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
        suit: CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)]
    };
    
    activeWarGame.player.card = playerCard;
    activeWarGame.cpu.card = cpuCard;
    activeWarGame.round++;
    
    setTimeout(() => {
        displayWarCards(playerCard, cpuCard);
        setTimeout(() => {
            evaluateWarRound(playerCard, cpuCard);
        }, 1000);
    }, 500);
}

function displayWarCards(playerCard, cpuCard) {
    const playerCardEl = document.getElementById('player-card');
    const cpuCardEl = document.getElementById('cpu-card');
    
    const playerColor = (playerCard.suit === '♥' || playerCard.suit === '♦') ? 'red' : 'black';
    const cpuColor = (cpuCard.suit === '♥' || cpuCard.suit === '♦') ? 'red' : 'black';
    
    // Play card flip sound
    playSound('flipcard');
    
    // Add flipping animation
    playerCardEl.classList.add('flipping');
    cpuCardEl.classList.add('flipping');
    
    setTimeout(() => {
        playerCardEl.className = `war-card ${playerColor}`;
        playerCardEl.innerHTML = `
            <div class="war-card-value">${playerCard.value}</div>
            <div class="war-card-suit">${playerCard.suit}</div>
        `;
        
        cpuCardEl.className = `war-card ${cpuColor}`;
        cpuCardEl.innerHTML = `
            <div class="war-card-value">${cpuCard.value}</div>
            <div class="war-card-suit">${cpuCard.suit}</div>
        `;
    }, 300);
    
    setTimeout(() => {
        playerCardEl.classList.remove('flipping');
        cpuCardEl.classList.remove('flipping');
    }, 600);
}

function evaluateWarRound(playerCard, cpuCard) {
    const playerValue = CARD_VALUES.indexOf(playerCard.value);
    const cpuValue = CARD_VALUES.indexOf(cpuCard.value);
    
    let result = '';
    
    if (playerValue > cpuValue) {
        activeWarGame.player.score++;
        result = '🎉 You won this round!';
    } else if (cpuValue > playerValue) {
        activeWarGame.cpu.score++;
        result = '😔 CPU won this round!';
    } else {
        result = '🤝 It\'s a tie!';
    }
    
    document.getElementById('war-status').textContent = result;
    document.getElementById('war-player-score').textContent = activeWarGame.player.score;
    document.getElementById('war-cpu-score').textContent = activeWarGame.cpu.score;
    document.getElementById('war-round').textContent = activeWarGame.round;
    
    if (activeWarGame.round < activeWarGame.maxRounds) {
        document.getElementById('war-draw-btn').disabled = false;
        document.getElementById('war-draw-btn').textContent = 'Draw Next Cards';
    } else {
        endWarGame();
    }
}

function endWarGame() {
    const game = activeWarGame;
    
    setTimeout(() => {
        let finalMessage = '';
        const statusEl = document.getElementById('war-status');
        
        if (game.player.score > game.cpu.score) {
            playSound('win');
            createConfetti();
            finalMessage = `🎉 YOU WON!`;
            game.winner = 'player';
            if (statusEl) {
                statusEl.classList.add('victory');
                statusEl.style.color = '#00ff00';
                statusEl.style.fontSize = '1.4rem';
            }
        } else if (game.cpu.score > game.player.score) {
            playSound('loss');
            finalMessage = `😔 YOU LOST!`;
            game.winner = 'cpu';
            if (statusEl) {
                statusEl.classList.add('defeat');
                statusEl.style.color = '#ff0000';
                statusEl.style.fontSize = '1.4rem';
            }
        } else {
            finalMessage = `🤝 IT'S A DRAW!`;
            game.winner = 'draw';
            if (statusEl) {
                statusEl.style.color = '#ffaa00';
                statusEl.style.fontSize = '1.2rem';
            }
        }
        
        if (statusEl) statusEl.textContent = finalMessage;
        document.getElementById('war-draw-btn').textContent = 'Game Over - Close to Exit';
    }, 500);
}

function closeWarGame() {
    const overlay = document.getElementById('war-game-overlay');
    if (overlay) overlay.remove();
    activeWarGame = null;
}

function loadWarGames() {
    const listElement = document.getElementById('war-games-list');
    listElement.innerHTML = '<p class="loading-text">Demo mode: Click Create Game to play vs CPU!</p>';
}

function loadMyWarGames() {
    const listElement = document.getElementById('war-my-games-list');
    listElement.innerHTML = '<p class="loading-text">Create games to see your history here.</p>';
}

// ========== ROCK PAPER SCISSORS FUNCTIONS ==========
let activeRPSGame = null;

const RPS_CHOICES = {
    ROCK: '✊',
    PAPER: '✋',
    SCISSORS: '✌️'
};

function openRPSModal() {
    if (!DEMO_MODE) {
        alert('RPS requires Demo Mode or deployed smart contract. Please enable Demo Mode.');
        return;
    }
    
    document.getElementById('rps-modal').style.display = 'flex';
    switchRPSTab('create');
}

function closeRPSModal() {
    document.getElementById('rps-modal').style.display = 'none';
}

function switchRPSTab(tab) {
    document.querySelectorAll('#rps-modal .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#rps-modal .tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'create') {
        document.getElementById('rps-create-tab').classList.add('active');
        document.querySelectorAll('#rps-modal .tab-btn')[0].classList.add('active');
    } else if (tab === 'join') {
        document.getElementById('rps-join-tab').classList.add('active');
        document.querySelectorAll('#rps-modal .tab-btn')[1].classList.add('active');
        loadRPSGames();
    } else if (tab === 'my-games') {
        document.getElementById('rps-my-games-tab').classList.add('active');
        document.querySelectorAll('#rps-modal .tab-btn')[2].classList.add('active');
        loadMyRPSGames();
    }
}

function createRPSGame() {
    if (!DEMO_MODE) {
        alert('Demo mode required');
        return;
    }
    
    const stakeInput = document.getElementById('rps-stake');
    const stake = parseFloat(stakeInput.value) || 0.01;
    
    const userAddress = arcadeApp.walletAddress || generateBotAddress();
    const userName = arcadeApp.username || 'You';
    
    // Create Best of 3 game vs CPU
    const game = {
        stake: stake.toFixed(3),
        pot: (stake * 2).toFixed(3),
        player: { name: userName, score: 0, choice: null },
        cpu: { name: 'CPU Player', score: 0, choice: null },
        round: 0,
        maxRounds: 3,
        winner: null,
        roundResult: ''
    };
    
    activeRPSGame = game;
    
    showStatus('rps-create-status', 'Game created! Best of 3 rounds!', 'success');
    
    setTimeout(() => {
        closeRPSModal();
        launchRPSBoard(game);
    }, 1000);
}

function launchRPSBoard(game) {
    const overlay = document.createElement('div');
    overlay.id = 'rps-game-overlay';
    overlay.innerHTML = `
        <div class="game-board-container">
            <div class="game-board-header">
                <h3 class="neon">Rock Paper Scissors</h3>
                <div class="game-players">
                    <span class="player-indicator p1">👤 ${game.player.name}</span>
                    <span class="vs">VS</span>
                    <span class="player-indicator p2">🤖 ${game.cpu.name}</span>
                </div>
                <div class="rps-score">
                    <div class="rps-score-item">You: <span id="rps-player-score">0</span></div>
                    <div class="rps-score-item">Round: <span id="rps-current-round">1</span>/${game.maxRounds}</div>
                    <div class="rps-score-item">CPU: <span id="rps-cpu-score">0</span></div>
                </div>
                <button onclick="closeRPSGame()" class="close-game-btn">Exit Game</button>
            </div>
            <div class="rps-board">
                <div id="rps-status" class="turn-indicator">Choose your weapon!</div>
                <div class="rps-choices">
                    <button class="rps-choice-btn" onclick="makeRPSChoice('ROCK')">✊</button>
                    <button class="rps-choice-btn" onclick="makeRPSChoice('PAPER')">✋</button>
                    <button class="rps-choice-btn" onclick="makeRPSChoice('SCISSORS')">✌️</button>
                </div>
                <div id="rps-result" class="rps-result" style="display: none;">
                    <div class="rps-player-choice">
                        <div class="emoji" id="player-choice-emoji"></div>
                        <div>${game.player.name}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="rps-player-choice">
                        <div class="emoji" id="cpu-choice-emoji"></div>
                        <div>${game.cpu.name}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function makeRPSChoice(choice) {
    const game = activeRPSGame;
    
    // Add shake animation to selected button
    const buttons = document.querySelectorAll('.rps-choice-btn');
    buttons.forEach((btn, index) => {
        if ((choice === 'ROCK' && index === 0) || 
            (choice === 'PAPER' && index === 1) || 
            (choice === 'SCISSORS' && index === 2)) {
            btn.classList.add('selecting');
            setTimeout(() => btn.classList.remove('selecting'), 500);
        }
    });
    
    // Disable buttons during round
    setTimeout(() => {
        buttons.forEach(btn => btn.disabled = true);
    }, 500);
    
    game.player.choice = choice;
    
    // CPU makes random choice
    const choices = Object.keys(RPS_CHOICES);
    game.cpu.choice = choices[Math.floor(Math.random() * choices.length)];
    
    game.round++;
    
    // Show choices
    document.getElementById('rps-status').textContent = 'Revealing choices...';
    
    setTimeout(() => {
        showRPSChoices(game);
        setTimeout(() => {
            evaluateRPSRound(game);
        }, 1000);
    }, 1000);
}

function showRPSChoices(game) {
    playSound('flipcard');
    document.getElementById('player-choice-emoji').textContent = RPS_CHOICES[game.player.choice];
    document.getElementById('cpu-choice-emoji').textContent = RPS_CHOICES[game.cpu.choice];
    document.getElementById('rps-result').style.display = 'flex';
}

function evaluateRPSRound(game) {
    const player = game.player.choice;
    const cpu = game.cpu.choice;
    
    let result = '';
    
    if (player === cpu) {
        result = '🤝 This round is a tie!';
        game.round--; // Tie doesn't count
    } else if (
        (player === 'ROCK' && cpu === 'SCISSORS') ||
        (player === 'PAPER' && cpu === 'ROCK') ||
        (player === 'SCISSORS' && cpu === 'PAPER')
    ) {
        game.player.score++;
        result = '🎉 You won this round!';
    } else {
        game.cpu.score++;
        result = '😔 CPU won this round!';
    }
    
    game.roundResult = result;
    
    document.getElementById('rps-status').textContent = result;
    document.getElementById('rps-player-score').textContent = game.player.score;
    document.getElementById('rps-cpu-score').textContent = game.cpu.score;
    document.getElementById('rps-current-round').textContent = game.round;
    
    // Check if game is over
    if (game.player.score === 2 || game.cpu.score === 2 || game.round >= game.maxRounds) {
        setTimeout(() => endRPSGame(game), 2000);
    } else {
        setTimeout(() => resetRPSRound(), 2000);
    }
}

function resetRPSRound() {
    document.getElementById('rps-result').style.display = 'none';
    document.getElementById('rps-status').textContent = 'Choose your weapon!';
    document.querySelectorAll('.rps-choice-btn').forEach(btn => btn.disabled = false);
}

function endRPSGame(game) {
    let finalMessage = '';
    const statusEl = document.getElementById('rps-status');
    
    if (game.player.score > game.cpu.score) {
        playSound('win');
        createConfetti();
        finalMessage = `🎉 YOU WON!`;
        game.winner = 'player';
        if (statusEl) {
            statusEl.classList.add('victory');
            statusEl.style.color = '#00ff00';
            statusEl.style.fontSize = '1.4rem';
        }
    } else if (game.cpu.score > game.player.score) {
        playSound('loss');
        finalMessage = `😔 YOU LOST!`;
        game.winner = 'cpu';
        if (statusEl) {
            statusEl.classList.add('defeat');
            statusEl.style.color = '#ff0000';
            statusEl.style.fontSize = '1.4rem';
        }
    } else {
        finalMessage = `🤝 IT'S A DRAW!`;
        game.winner = 'draw';
        if (statusEl) {
            statusEl.style.color = '#ffaa00';
            statusEl.style.fontSize = '1.2rem';
        }
    }
    
    if (statusEl) statusEl.textContent = finalMessage;
    document.querySelectorAll('.rps-choice-btn').forEach(btn => btn.disabled = true);
}

function closeRPSGame() {
    const overlay = document.getElementById('rps-game-overlay');
    if (overlay) overlay.remove();
    activeRPSGame = null;
}

function loadRPSGames() {
    const listElement = document.getElementById('rps-games-list');
    listElement.innerHTML = '<p class="loading-text">Demo mode: Click Create Game to play vs CPU!</p>';
}

function loadMyRPSGames() {
    const listElement = document.getElementById('rps-my-games-list');
    listElement.innerHTML = '<p class="loading-text">Create games to see your history here.</p>';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const coinTossModal = document.getElementById('coin-toss-modal');
    const connect4Modal = document.getElementById('connect4-modal');
    const warModal = document.getElementById('war-modal');
    const rpsModal = document.getElementById('rps-modal');
    
    if (event.target === coinTossModal) {
        closeCoinTossModal();
    }
    if (event.target === connect4Modal) {
        closeConnect4Modal();
    }
    if (event.target === warModal) {
        closeWarModal();
    }
    if (event.target === rpsModal) {
        closeRPSModal();
    }
};

// Auto-refresh games list
setInterval(() => {
    if (DEMO_MODE && document.getElementById('coin-toss-modal').style.display === 'flex') {
        refreshGamesList();
    }
}, 5000);
