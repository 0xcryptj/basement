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
const DEMO_MODE = true; // Set to false when contracts are deployed
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

// Initialize app
let arcadeApp;
document.addEventListener('DOMContentLoaded', () => {
    arcadeApp = new ArcadeApp();
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
    
    // Remove settled games after 30 seconds
    setTimeout(() => {
        demoGames = demoGames.filter(g => g.id !== gameId);
        saveDemoGames();
        refreshGamesList();
    }, 30000);
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
    
    // Bot joins after 5-10 seconds
    setTimeout(() => {
        const game = demoGames.find(g => g.id === demoGameIdCounter - 1);
        if (game && game.state === 0) {
            botJoinGame();
            refreshGamesList();
        }
    }, 5000 + Math.random() * 5000);
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
    showStatus('join-status', `Demo: Joined game #${gameId}! Revealing...`, 'success');
    
    // Auto-reveal after 2 seconds
    setTimeout(() => {
        botRevealSpecificGame(gameId);
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
    switchCoinTossTab('create');
    loadOpenGames();
}

function closeCoinTossModal() {
    document.getElementById('coin-toss-modal').style.display = 'none';
}

function switchCoinTossTab(tab) {
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
function selectCreateChoice(choice) {
    selectedCreateChoice = choice;
    document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function selectJoinChoice(choice) {
    selectedJoinChoice = choice;
    const buttons = document.querySelectorAll('#join-choice-buttons .choice-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

// Create Game
async function createGame() {
    const stakeInput = document.getElementById('stake-input');
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
            switchCoinTossTab('my-games');
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
            switchCoinTossTab('my-games');
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

// ========== CONNECT 4 PLACEHOLDER FUNCTIONS ==========
function openConnect4Modal() {
    alert('Connect 4 coming soon! Smart contract under development.');
}

function closeConnect4Modal() {
    document.getElementById('connect4-modal').style.display = 'none';
}

function switchConnect4Tab() {
    // Placeholder
}

function createConnect4Game() {
    alert('Connect 4 coming soon!');
}

function loadConnect4Games() {
    // Placeholder
}

function loadMyConnect4Games() {
    // Placeholder
}

// ========== WAR PLACEHOLDER FUNCTIONS ==========
function openWarModal() {
    alert('War card game coming soon! Smart contract under development.');
}

function closeWarModal() {
    document.getElementById('war-modal').style.display = 'none';
}

function switchWarTab() {
    // Placeholder
}

function createWarGame() {
    alert('War coming soon!');
}

function loadWarGames() {
    // Placeholder
}

function loadMyWarGames() {
    // Placeholder
}

// ========== ROCK PAPER SCISSORS PLACEHOLDER FUNCTIONS ==========
function openRPSModal() {
    alert('Rock Paper Scissors coming soon! Smart contract under development.');
}

function closeRPSModal() {
    document.getElementById('rps-modal').style.display = 'none';
}

function switchRPSTab() {
    // Placeholder
}

function createRPSGame() {
    alert('RPS coming soon!');
}

function loadRPSGames() {
    // Placeholder
}

function loadMyRPSGames() {
    // Placeholder
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
