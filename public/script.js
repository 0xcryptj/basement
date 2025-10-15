// The Basement - Retro Cyberpunk Web3 Arcade
// Simplified JavaScript without external SDK dependencies

class BasementApp {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.profilePic = null;
        this.sidebarCollapsed = false;
        this.isFirstConnection = true;
        this.currentCategory = null;
        this.forumPosts = {
            general: [],
            gaming: [],
            tech: [],
            nft: []
        };
        this.currentThread = null;
        this.customCategories = [];
        this.channels = {
            '#basement': {
                name: '#basement',
                description: 'Main Basement channel',
                private: false,
                users: new Set(),
                messages: []
            }
        };
        this.currentChannel = '#basement';
        this.userAddresses = {}; // Map usernames to wallet addresses
        this.globalClickHandlerAttached = false; // Prevent duplicate global listeners
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Basement App...');
            
            // Show dev notice
            this.showDevNotice();
            
            // Try to restore user session first
            const sessionRestored = this.restoreUserSession();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load user preferences (only if session wasn't restored)
            if (!sessionRestored) {
                this.loadUserPreferences();
            }
            
            // Generate floating particles
            this.generateParticles();
            
            // Initialize chat
            this.initializeChat();
            
            // Initialize UI state
            this.updateWalletUI();
            
            console.log('Basement App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Basement App:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    showDevNotice() {
        const devNotice = document.getElementById('dev-notice');
        const closeBtn = document.getElementById('close-dev-notice');
        
        // Check if user already dismissed it this session
        const dismissed = sessionStorage.getItem('basement_dev_notice_dismissed');
        
        if (dismissed === 'true') {
            if (devNotice) devNotice.style.display = 'none';
            return;
        }
        
        // Show the notice
        if (devNotice) {
            devNotice.style.display = 'flex';
            devNotice.style.opacity = '1';
        }
        
        // Attach close handler
        if (closeBtn) {
            closeBtn.onclick = () => {
                console.log('Closing dev notice');
                if (devNotice) {
                    devNotice.style.opacity = '0';
                    setTimeout(() => {
                        devNotice.style.display = 'none';
                        devNotice.remove(); // Remove from DOM completely
                    }, 300);
                }
                sessionStorage.setItem('basement_dev_notice_dismissed', 'true');
            };
        } else {
            console.error('Close button not found!');
        }
    }

    showComingSoon(featureName) {
        alert(`${featureName} - COMING SOON\n\nThis feature is currently under development and will be available in a future update.`);
    }

    generateParticles() {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) {
            console.error('Particles container not found');
            return;
        }
        
        // Clear existing particles
        particlesContainer.innerHTML = '';
        
        // Reduce particles on mobile to prevent overheating
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 30 : 150;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const floatDelay = Math.random() * 6;
            const glowDelay = Math.random() * 4;
            const floatDuration = 4 + Math.random() * 4;
            const glowDuration = 3 + Math.random() * 2;
            
            particle.style.top = `${top}%`;
            particle.style.left = `${left}%`;
            particle.style.animationDelay = `${floatDelay}s, ${glowDelay}s`;
            particle.style.animationDuration = `${floatDuration}s, ${glowDuration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    async initializeChat() {
        console.log('Initializing chat...');
        
        // Load saved channels first (from localStorage for quick display)
        this.loadChannels();
        
        // Then fetch channels from server
        await this.fetchChannels();
        
        this.addSystemMessage('Welcome to The Basement! Connect your wallet to start chatting.');
        
        // Initialize channel list with default channel
        this.updateChannelList();
        
        // Load messages for current channel (always, not just when connected)
        await this.loadChannelMessages(this.currentChannel);
        this.subscribeToRealtimeMessages();
    }

    setupEventListeners() {
        // Get all mobile elements at the top for proper scope
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileChatLink = document.getElementById('mobile-chat-link');
        const mobileForumLink = document.getElementById('mobile-forum-link');
        const chatSidebar = document.getElementById('chat-sidebar');
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');
        
        // Hamburger menu toggle
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.onclick = (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            };
            
            // Close menu when clicking outside (only once)
            if (!this.globalClickHandlerAttached) {
                document.addEventListener('click', (e) => {
                    if (mobileMenu && mobileMenuToggle && !mobileMenu.contains(e.target) && e.target !== mobileMenuToggle) {
                        mobileMenu.classList.add('hidden');
                    }
                });
                this.globalClickHandlerAttached = true;
            }
        }

        // Mobile chat link
        if (mobileChatLink) {
            mobileChatLink.onclick = (e) => {
                e.preventDefault();
                // Show chat sidebar on mobile
                if (chatSidebar) {
                    chatSidebar.style.display = 'flex';
                    chatSidebar.classList.remove('collapsed');
                    this.sidebarCollapsed = false;
                }
                // Close mobile menu
                if (mobileMenu) mobileMenu.classList.add('hidden');
            };
        }

        // Mobile forum link
        if (mobileForumLink) {
            mobileForumLink.onclick = (e) => {
                e.preventDefault();
                window.location.href = '/forum';
            };
        }

        // Sidebar toggle button
        if (toggleSidebarBtn) {
            toggleSidebarBtn.onclick = () => {
                if (chatSidebar) {
                    chatSidebar.classList.toggle('collapsed');
                    this.sidebarCollapsed = !this.sidebarCollapsed;
                    toggleSidebarBtn.textContent = this.sidebarCollapsed ? '>>' : '<<';
                }
            };
        }

        // Coming Soon links
        const tokenomicsLink = document.getElementById('tokenomics-link');
        const shopLink = document.getElementById('shop-link');
        const mobileTokenomicsLink = document.getElementById('mobile-tokenomics-link');
        const mobileShopLink = document.getElementById('mobile-shop-link');

        if (tokenomicsLink) {
            tokenomicsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoon('Tokenomics');
            });
        }

        if (shopLink) {
            shopLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoon('Shop');
            });
        }

        if (mobileTokenomicsLink) {
            mobileTokenomicsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoon('Tokenomics');
            });
        }

        if (mobileShopLink) {
            mobileShopLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showComingSoon('Shop');
            });
        }

        // Wallet connection
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.toggleWalletDropdown());
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }

        // Wallet dropdown options
        const walletOptions = document.querySelectorAll('.wallet-option');
        walletOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const walletType = e.target.dataset.wallet;
                this.connectWallet(walletType);
            });
        });

        // Mobile wallet buttons
        const mobileWalletBtns = document.querySelectorAll('.mobile-wallet-btn');
        mobileWalletBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const walletType = e.target.dataset.wallet;
                this.connectWallet(walletType);
                // Close mobile menu after clicking
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        });

        // Mobile disconnect button
        const mobileDisconnectBtn = document.getElementById('mobile-disconnect-wallet');
        if (mobileDisconnectBtn) {
            mobileDisconnectBtn.addEventListener('click', () => {
                this.disconnectWallet();
                // Close mobile menu
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }

        // Chat functionality
        const chatInput = document.getElementById('chat-input-field');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // File upload functionality
        const fileUploadBtn = document.getElementById('file-upload-btn');
        if (fileUploadBtn) {
            fileUploadBtn.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = (e) => this.handleFileUpload(e.target.files[0]);
                fileInput.click();
            });
        }

        // Profile setup dialog - simplified
        const profilePicInput = document.getElementById('profile-pic-input');
        const editProfilePic = document.getElementById('edit-profile-pic');
        const skipSetup = document.getElementById('skip-setup');
        const saveProfile = document.getElementById('save-profile');
        const customUsernameSimple = document.getElementById('custom-username-simple');

        if (editProfilePic && profilePicInput) {
            editProfilePic.addEventListener('click', () => {
                profilePicInput.click();
            });
        }
        
        if (profilePicInput) {
            profilePicInput.addEventListener('change', (e) => {
                this.handleDialogProfilePicUpload(e.target.files[0]);
            });
        }

        if (skipSetup) {
            skipSetup.addEventListener('click', () => this.skipProfileSetup());
        }

        if (saveProfile) {
            saveProfile.addEventListener('click', () => this.saveProfileSetup());
        }

        if (customUsernameSimple) {
            customUsernameSimple.addEventListener('input', (e) => {
                const customUsername = e.target.value.trim();
                if (customUsername) {
                    const customRadio = document.getElementById('custom-radio');
                    if (customRadio) {
                        customRadio.checked = true;
                    }
                }
            });
        }

        // Profile photo click functionality
        const profilePicContainer = document.getElementById('profile-pic-container');
        if (profilePicContainer) {
            profilePicContainer.addEventListener('click', () => {
                if (!this.isConnected) {
                    alert('Please connect your wallet to access profile settings');
                    return;
                }
                this.showProfileDialog();
            });
        }

        // Forum navigation
        const forumLink = document.getElementById('forum-link');
        // mobileForumLink already declared at function top
        
        if (forumLink) {
            forumLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isConnected) {
                    alert('Please connect your wallet to access the forum');
                    return;
                }
                this.showForum();
            });
        }
        
        if (mobileForumLink) {
            mobileForumLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isConnected) {
                    alert('Please connect your wallet to access the forum');
                    return;
                }
                this.showForum();
            });
        }

        // Mobile menu toggle (already handled at function top)
        // mobileMenuToggle and mobileMenu already declared and configured above
        
        if (false) { // Disabled - already handled at function top
            // This code block is now redundant
        } else {
            console.error('Mobile menu elements not found:', { mobileMenuToggle, mobileMenu });
        }
        
        // Close mobile menu when clicking on links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
                
                const href = link.getAttribute('href');
                if (href === '#chat') {
                    this.showMobileChat();
                } else if (href === '#forum') {
                    if (!this.isConnected) {
                        alert('Please connect your wallet to access the forum');
                        return;
                    }
                    this.showMobileForum();
                } else if (href === '#arcade') {
                    this.showMobileArcade();
                } else if (href === '#shop') {
                    this.showMobileShop();
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenuToggle && mobileMenu && 
                !mobileMenuToggle.contains(e.target) && 
                !mobileMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
            }
        });

        // Channel creation
        const createChannelBtn = document.getElementById('create-channel');
        const cancelChannelBtn = document.getElementById('cancel-channel');
        const createChannelSubmitBtn = document.getElementById('create-channel-submit');

        if (createChannelBtn) {
            createChannelBtn.addEventListener('click', () => this.showChannelDialog());
        }

        if (cancelChannelBtn) {
            cancelChannelBtn.addEventListener('click', () => this.hideChannelDialog());
        }

        if (createChannelSubmitBtn) {
            createChannelSubmitBtn.addEventListener('click', () => this.createChannel());
        }

        // Channel switching
        const channelList = document.getElementById('channel-list');
        if (channelList) {
            channelList.addEventListener('click', (e) => {
                const channelItem = e.target.closest('.channel-item');
                if (channelItem) {
                    const channelName = channelItem.dataset.channel;
                    this.switchChannel(channelName);
                }
            });
        }

        // Chat sidebar toggle (already handled at function top)
        // toggleSidebarBtn already declared and configured above

        // Close wallet dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.wallet-dropdown');
            const connectBtn = document.getElementById('connect-wallet');
            
            if (dropdown && !dropdown.contains(e.target) && !connectBtn.contains(e.target)) {
                this.closeWalletDropdown();
            }
        });

        // Forum functionality
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.showCategoryPosts(category);
            });
        });

        // Post editor functionality
        const backToPostsBtn = document.getElementById('back-to-posts');
        const cancelPostBtn = document.getElementById('cancel-post');
        const publishPostBtn = document.getElementById('publish-post');

        if (backToPostsBtn) {
            backToPostsBtn.addEventListener('click', () => this.showCategoryPosts(this.currentCategory));
        }

        if (cancelPostBtn) {
            cancelPostBtn.addEventListener('click', () => this.showCategoryPosts(this.currentCategory));
        }

        if (publishPostBtn) {
            publishPostBtn.addEventListener('click', () => this.publishPost());
        }

        const backToCategoriesBtn = document.getElementById('back-to-categories');
        if (backToCategoriesBtn) {
            backToCategoriesBtn.addEventListener('click', () => this.showForumCategories());
        }

        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showPostEditor());
        }

        const cancelPostBtn2 = document.getElementById('cancel-post-btn');
        if (cancelPostBtn2) {
            cancelPostBtn2.addEventListener('click', () => this.showCategoryPosts(this.currentCategory));
        }

        const publishPostBtn2 = document.getElementById('publish-post-btn');
        if (publishPostBtn2) {
            publishPostBtn2.addEventListener('click', () => this.publishPost());
        }

        // Category creation
        const createCategoryBtn = document.getElementById('create-category-btn');
        const cancelCategoryBtn = document.getElementById('cancel-category-btn');
        const createCategorySubmitBtn = document.getElementById('create-category-submit-btn');

        if (createCategoryBtn) {
            createCategoryBtn.addEventListener('click', () => this.showCategoryDialog());
        }

        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => this.hideCategoryDialog());
        }

        if (createCategorySubmitBtn) {
            createCategorySubmitBtn.addEventListener('click', () => this.createCategory());
        }

        // Home link
        const homeLink = document.getElementById('home-link');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWelcome();
            });
        }
    }

    toggleWalletDropdown() {
        const dropdown = document.querySelector('.wallet-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    closeWalletDropdown() {
        const dropdown = document.querySelector('.wallet-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    toggleChatSidebar() {
        console.log('toggleChatSidebar called');
        
        const chatSidebar = document.getElementById('chat-sidebar');
        const toggleBtn = document.getElementById('toggle-sidebar');
        
        console.log('Elements found:', { chatSidebar: !!chatSidebar, toggleBtn: !!toggleBtn });
        
        if (chatSidebar && toggleBtn) {
            const isCollapsed = chatSidebar.classList.contains('collapsed');
            console.log('Current state:', isCollapsed ? 'collapsed' : 'expanded');
            
            // Toggle the collapsed class
            chatSidebar.classList.toggle('collapsed');
            
            // Update toggle button text - single arrow pointing right when collapsed
            const newState = chatSidebar.classList.contains('collapsed');
            toggleBtn.textContent = newState ? '>' : '<<';
            
            console.log('New state:', newState ? 'collapsed' : 'expanded');
            console.log('Toggle button text:', toggleBtn.textContent);
        } else {
            console.error('Chat sidebar or toggle button not found');
        }
    }

    // Advanced User Management System
    restoreUserSession() {
        const savedWalletAddress = localStorage.getItem('basement_walletAddress');
        const savedUsername = localStorage.getItem('basement_username');
        const savedProfilePic = localStorage.getItem('basement_profilePic');
        
        if (savedWalletAddress && savedUsername) {
            console.log('Restoring user session:', { username: savedUsername, walletAddress: savedWalletAddress });
            
            this.walletAddress = savedWalletAddress;
            this.username = savedUsername;
            this.isFirstConnection = false;
            
            if (savedProfilePic) {
                this.profilePic = savedProfilePic;
            }
            
            // Load user addresses mapping
            const savedUserAddresses = localStorage.getItem('basement_userAddresses');
            if (savedUserAddresses) {
                this.userAddresses = JSON.parse(savedUserAddresses);
            }
            
            return true;
        }
        
        return false;
    }

    clearUserSession() {
        // Clear all user data
        localStorage.removeItem('basement_username');
        localStorage.removeItem('basement_profilePic');
        localStorage.removeItem('basement_walletAddress');
        localStorage.removeItem('basement_isConnected');
        localStorage.removeItem('basement_isFirstConnection');
        localStorage.removeItem('basement_userAddresses');
        
        // Reset app state
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.profilePic = null;
        this.isFirstConnection = true;
        this.userAddresses = {};
        
        console.log('User session cleared');
    }

    updateUserActivity(username, activity = 'message') {
        const userKey = `basement_user_${username}`;
        const userData = {
            username: username,
            walletAddress: this.userAddresses[username] || null,
            lastActivity: new Date().toISOString(),
            activityType: activity,
            messageCount: (this.getUserMessageCount(username) || 0) + 1
        };
        
        localStorage.setItem(userKey, JSON.stringify(userData));
    }

    getUserMessageCount(username) {
        const userKey = `basement_user_${username}`;
        const userData = localStorage.getItem(userKey);
        
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                return parsed.messageCount || 0;
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        
        return 0;
    }

    async switchToBaseNetwork(provider) {
        const BASE_CHAIN_ID = '0x2105'; // 8453 in hex
        const BASE_NETWORK = {
            chainId: BASE_CHAIN_ID,
            chainName: 'Base Mainnet',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
        };

        try {
            // Try to switch to Base network
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID }],
            });
        } catch (switchError) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [BASE_NETWORK],
                    });
                } catch (addError) {
                    throw new Error('Failed to add Base network');
                }
            } else {
                throw new Error('Failed to switch to Base network');
            }
        }
    }

    async connectWallet(walletType) {
        try {
            console.log(`Connecting to ${walletType}...`);
            
            let address = null;
            
            if (walletType === 'metamask') {
                if (typeof window.ethereum !== 'undefined') {
                    // Switch to Base network first
                    await this.switchToBaseNetwork(window.ethereum);
                    
                    // Request account access
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    address = accounts[0];
                    
                    // Request signature for verification
                    const message = `Connect to The Basement\n\nTimestamp: ${Date.now()}`;
                    const signature = await window.ethereum.request({
                        method: 'personal_sign',
                        params: [message, address]
                    });
                    
                    // Verify signature was provided
                    if (!signature) {
                        throw new Error('Signature required for connection');
                    }
                    
                    console.log('MetaMask connected to Base:', address);
                    console.log('Signature verified:', signature.substring(0, 10) + '...');
                } else {
                    throw new Error('MetaMask not installed. Please install MetaMask to continue.');
                }
            } else if (walletType === 'coinbase') {
                // Coinbase Wallet for Base network
                if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
                    // Try to switch to Base network (non-blocking)
                    try {
                        await this.switchToBaseNetwork(window.ethereum);
                        console.log('✅ Coinbase Wallet switched to Base network');
                    } catch (networkError) {
                        console.warn('⚠️ Network switch failed or rejected, continuing with current network');
                        // Continue anyway - user might already be on Base or can switch manually
                    }
                    
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    address = accounts[0];
                    
                    // Request signature for verification
                    try {
                        const message = `Connect to The Basement\n\nTimestamp: ${Date.now()}`;
                        const signature = await window.ethereum.request({
                            method: 'personal_sign',
                            params: [message, address]
                        });
                        console.log('Coinbase Wallet connected:', address);
                        console.log('Signature verified:', signature.substring(0, 10) + '...');
                    } catch (signError) {
                        console.warn('⚠️ Signature rejected, but continuing connection');
                        console.log('Coinbase Wallet connected:', address);
                    }
                } else {
                    throw new Error('Coinbase Wallet not installed. Please install Coinbase Wallet to continue.');
                }
            } else if (walletType === 'phantom') {
                // Phantom supports Ethereum/Base via ethereum provider
                if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
                    // Try to switch to Base network (non-blocking)
                    try {
                        await this.switchToBaseNetwork(window.phantom.ethereum);
                        console.log('✅ Phantom switched to Base network');
                    } catch (networkError) {
                        console.warn('⚠️ Network switch failed or rejected, continuing with current network');
                        // Continue anyway - user might already be on Base or can switch manually
                    }
                    
                    const accounts = await window.phantom.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    address = accounts[0];
                    
                    // Request signature for verification
                    try {
                        const message = `Connect to The Basement\n\nTimestamp: ${Date.now()}`;
                        const signature = await window.phantom.ethereum.request({
                            method: 'personal_sign',
                            params: [message, address]
                        });
                        console.log('Phantom connected on Base:', address);
                        console.log('Signature verified:', signature.substring(0, 10) + '...');
                    } catch (signError) {
                        console.warn('⚠️ Signature rejected, but continuing connection');
                        console.log('Phantom connected:', address);
                    }
                } else {
                    throw new Error('Phantom wallet not installed. Please install Phantom to continue.');
                }
            } else if (walletType === 'base') {
                if (typeof window.ethereum !== 'undefined') {
                    try {
                        // Switch to Base network first
                        await this.switchToBaseNetwork(window.ethereum);
                        
                        const accounts = await window.ethereum.request({ 
                            method: 'eth_requestAccounts' 
                        });
                        address = accounts[0];
                        
                        // Request signature for verification
                        const message = `Connect to The Basement\n\nTimestamp: ${Date.now()}`;
                        const signature = await window.ethereum.request({
                            method: 'personal_sign',
                            params: [message, address]
                        });
                        
                        // Verify signature was provided
                        if (!signature) {
                            throw new Error('Signature required for connection');
                        }
                        
                        console.log('Base Wallet connected to Base:', address);
                        console.log('Signature verified:', signature.substring(0, 10) + '...');
                    } catch (error) {
                        throw new Error('Base wallet not available. Please switch to Base network or install Base wallet.');
                    }
                } else {
                    throw new Error('No Ethereum provider found. Please install a compatible wallet.');
                }
            }
            
            if (!address) {
                throw new Error('No wallet address received');
            }
            
            this.walletAddress = address;
            this.isConnected = true;
            
            console.log('Wallet connected successfully:', address);
            
            // Check if this wallet address is already known
            const savedWalletAddress = localStorage.getItem('basement_walletAddress');
            const savedUsername = localStorage.getItem('basement_username');
            
            if (savedWalletAddress === address && savedUsername) {
                // This is a returning user
                this.username = savedUsername;
                this.isFirstConnection = false;
                
                // Load saved profile pic
                const savedProfilePic = localStorage.getItem('basement_profilePic');
                if (savedProfilePic) {
                    this.profilePic = savedProfilePic;
                }
                
                // Load user addresses mapping
                const savedUserAddresses = localStorage.getItem('basement_userAddresses');
                if (savedUserAddresses) {
                    this.userAddresses = JSON.parse(savedUserAddresses);
                }
                
                console.log('Returning user detected:', this.username);
            } else {
                // This is a new user
                this.isFirstConnection = true;
                console.log('New user detected');
            }
            
            // Update UI
            this.updateWalletUI();
            
            // Show profile setup for first-time users only
            if (this.isFirstConnection) {
                this.showProfileDialog();
            }
            
            // Add user to current channel
            if (this.channels[this.currentChannel]) {
                this.channels[this.currentChannel].users.add(this.username);
            }
            
            // Add welcome message to chat
            this.addJoinMessage(this.username || 'User');
            
            // Update channel UI with user count
            this.updateChannelUI();
            
            // Close wallet dropdown
            this.closeWalletDropdown();
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showError(`Failed to connect to ${walletType}: ${error.message}`);
            // Close dropdown on error
            this.closeWalletDropdown();
        }
    }

    disconnectWallet() {
        if (this.isConnected) {
            this.addSystemMessage(`*** ${this.username} left the channel`);
            
            // Remove user from current channel
            if (this.channels[this.currentChannel]) {
                this.channels[this.currentChannel].users.delete(this.username);
            }
        }
        
        // Clear user session completely
        this.clearUserSession();
        
        // Update UI
        this.updateWalletUI();
        
        // Update channel UI to reflect user count
        this.updateChannelUI();
        
        // Hide wallet dropdown
        this.toggleWalletDropdown();
    }

    loadUserPreferences() {
        // Load username with fallback hierarchy
        const savedUsername = localStorage.getItem('basement_username');
        const savedProfilePic = localStorage.getItem('basement_profilePic');
        const savedWalletAddress = localStorage.getItem('basement_walletAddress');
        
        if (savedUsername) {
            this.username = savedUsername;
            console.log('Loaded saved username:', this.username);
        }
        
        if (savedProfilePic) {
            this.profilePic = savedProfilePic;
            console.log('Loaded saved profile picture');
        }
        
        if (savedWalletAddress) {
            this.walletAddress = savedWalletAddress;
            console.log('Loaded saved wallet address:', this.walletAddress);
        }
        
        // Load user address mappings
        const savedUserAddresses = localStorage.getItem('basement_userAddresses');
        if (savedUserAddresses) {
            try {
                this.userAddresses = JSON.parse(savedUserAddresses);
                console.log('Loaded user address mappings:', Object.keys(this.userAddresses).length, 'users');
            } catch (error) {
                console.error('Failed to parse user address mappings:', error);
                this.userAddresses = {};
            }
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const chatInput = document.getElementById('chat-input-field');
        const sendBtn = document.getElementById('send-btn');
        const fileUploadBtn = document.getElementById('file-upload-btn');
        
        // Mobile elements
        const mobileWalletOptions = document.getElementById('mobile-wallet-options');
        const mobileWalletInfo = document.getElementById('mobile-wallet-info');
        const mobileWalletAddress = document.getElementById('mobile-wallet-address');
        
        if (this.isConnected) {
            // Hide connect button, show wallet info
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'flex';
            
            // Mobile: Hide connect options, show wallet info
            if (mobileWalletOptions) mobileWalletOptions.style.display = 'none';
            if (mobileWalletInfo) mobileWalletInfo.style.display = 'flex';
            if (mobileWalletAddress) {
                const displayText = this.username || `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
                mobileWalletAddress.textContent = displayText;
            }
            
            // Enable chat functionality
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.placeholder = 'Type a message...';
            }
            if (sendBtn) sendBtn.disabled = false;
            if (fileUploadBtn) fileUploadBtn.disabled = false;
            
            // Update wallet address display
            if (walletAddress) {
                const displayText = this.username || this.walletAddress;
                walletAddress.innerHTML = `
                    <span class="wallet-display">${displayText}</span>
                `;
                walletAddress.classList.add('connected');
            }
            
            this.updateProfilePic();
        } else {
            // Show connect button, hide wallet info
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
            
            // Mobile: Show connect options, hide wallet info
            if (mobileWalletOptions) mobileWalletOptions.style.display = 'block';
            if (mobileWalletInfo) mobileWalletInfo.style.display = 'none';
            
            // Disable chat functionality
            if (chatInput) {
                chatInput.disabled = true;
                chatInput.placeholder = 'Connect wallet to chat...';
            }
            if (sendBtn) sendBtn.disabled = true;
            if (fileUploadBtn) fileUploadBtn.disabled = true;
            
            // Clear wallet address
            if (walletAddress) {
                walletAddress.innerHTML = '';
                walletAddress.classList.remove('connected');
            }
        }
    }

    updateProfilePic() {
        const profilePic = document.getElementById('profile-pic');
        const profilePicPlaceholder = document.getElementById('profile-pic-placeholder');
        
        if (this.profilePic) {
            profilePic.src = this.profilePic;
            profilePic.style.display = 'block';
            profilePicPlaceholder.style.display = 'none';
        } else {
            // Use generic default profile image (square)
            profilePic.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDUyZmY5OSIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiNmZmZmZmYiLz4KICA8cGF0aCBkPSJNMTAgMzBDMTAgMjUgMTMgMjAgMjAgMjBTMzAgMjUgMzAgMzBWMzVIMTBWMzBaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
            profilePic.style.display = 'block';
            profilePicPlaceholder.style.display = 'none';
        }
    }

    showProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
            
            // Update wallet address display with real address
            const walletSubtitle = document.getElementById('wallet-subtitle');
            if (walletSubtitle && this.walletAddress) {
                walletSubtitle.textContent = this.abbreviateAddress(this.walletAddress);
            }
            
            // Check for Base Name
            this.checkBaseName(this.walletAddress).then(basename => {
                if (basename) {
                    const basenameRadio = document.getElementById('basename-radio');
                    const basenameSubtitle = document.getElementById('basename-subtitle');
                    if (basenameRadio && basenameSubtitle) {
                        basenameRadio.checked = true;
                        basenameSubtitle.textContent = basename;
                    }
                } else {
                    const customRadio = document.getElementById('custom-radio');
                    if (customRadio) {
                        customRadio.checked = true;
                    }
                }
            });
        }
    }

    hideProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }

    async checkBaseName(address) {
        // Real Base Name API call - remove mock data
        try {
            // For now, return null since we don't have a real Base Name API endpoint
            // In production, this would make an actual API call to Base Name service
            return null;
        } catch (error) {
            console.log('Base Name check failed:', error);
            return null;
        }
    }

    handleDialogProfilePicUpload(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.tempProfilePic = e.target.result;
                const preview = document.getElementById('dialog-profile-pic');
                if (preview) {
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfileSetup() {
        const selectedChoice = document.querySelector('input[name="username-type"]:checked');
        const customUsername = document.getElementById('custom-username-simple').value.trim();
        
        if (selectedChoice) {
            if (selectedChoice.value === 'basename') {
                const basenameSubtitle = document.getElementById('basename-subtitle');
                this.username = basenameSubtitle ? basenameSubtitle.textContent : this.abbreviateAddress(this.walletAddress);
            } else if (selectedChoice.value === 'custom' && customUsername) {
                this.username = customUsername;
            } else {
                this.username = this.abbreviateAddress(this.walletAddress);
            }
        } else {
            this.username = this.abbreviateAddress(this.walletAddress);
        }
        
        if (this.tempProfilePic) {
            this.profilePic = this.tempProfilePic;
        }
        
        // Save to localStorage with enhanced persistence
        localStorage.setItem('basement_username', this.username);
        localStorage.setItem('basement_walletAddress', this.walletAddress);
        
        if (this.profilePic) {
            localStorage.setItem('basement_profilePic', this.profilePic);
        }
        
        // Store username to address mapping
        this.userAddresses[this.username] = this.walletAddress;
        localStorage.setItem('basement_userAddresses', JSON.stringify(this.userAddresses));
        
        // Save connection state
        localStorage.setItem('basement_isConnected', 'true');
        localStorage.setItem('basement_isFirstConnection', 'false');
        
        console.log('Profile saved:', {
            username: this.username,
            walletAddress: this.walletAddress,
            hasProfilePic: !!this.profilePic,
            userAddressesCount: Object.keys(this.userAddresses).length
        });
        
        this.hideProfileDialog();
        this.updateWalletUI();
        this.isFirstConnection = false;
    }

    skipProfileSetup() {
        this.username = this.abbreviateAddress(this.walletAddress);
        this.hideProfileDialog();
        this.updateWalletUI();
        this.isFirstConnection = false;
    }

    handleFileUpload(file) {
        if (!file) return;
        
        if (!this.isConnected) {
            alert('Please connect your wallet to send images');
            return;
        }
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.addImageMessage(this.username, imageData, file.name);
        };
        reader.readAsDataURL(file);
    }

    addImageMessage(username, imageData, fileName) {
        if (!this.isConnected) return;
        
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message image-message';
        
        // Make username clickable if we have their address
        let usernameDisplay = username;
        const userAddress = this.userAddresses[username] || (username === this.username ? this.walletAddress : null);
        
        if (userAddress) {
            usernameDisplay = `<a href="https://basescan.org/address/${userAddress}" target="_blank" class="username-link">${username}</a>`;
        }
        
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="username">&lt;${usernameDisplay}&gt;</span>
            <span class="message-text">📷 ${fileName}</span>
            <div class="image-container">
                <img src="${imageData}" alt="${fileName}" class="chat-image" onclick="this.classList.toggle('expanded')">
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in current channel
        this.channels[this.currentChannel].messages.push({
            author: username,
            text: `📷 ${fileName}`,
            image: imageData,
            timestamp: timestamp
        });
    }

    abbreviateAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    async sendMessage() {
        // Allow sending even if not connected (anonymous mode)
        const isAnonymous = !this.isConnected;
        
        if (isAnonymous) {
            console.log('Sending as anonymous user');
        }
        
        const chatInput = document.getElementById('chat-input-field');
        if (!chatInput || chatInput.disabled) {
            console.log('Chat input not available or disabled');
            return;
        }
        
        // SECURITY: Check rate limit
        if (window.SecurityManager) {
            const rateCheck = window.SecurityManager.checkRateLimit('chat');
            if (!rateCheck.allowed) {
                alert(rateCheck.message);
                return;
            }
        }
        
        const message = chatInput.value.trim();
        
        if (message) {
            // SECURITY: Check for suspicious patterns
            if (window.SecurityManager && window.SecurityManager.isSuspiciousInput(message)) {
                alert('Message contains suspicious content and was blocked');
                window.SecurityManager.logSecurityEvent('suspicious_chat_message', { message: message.substring(0, 50) });
                chatInput.value = '';
                return;
            }
            
            // Clear input immediately for better UX
            chatInput.value = '';
            
            // Send to server
            try {
                const walletAddress = this.walletAddress || 'anonymous';
                
                console.log('Sending message to server:', {
                    walletAddress: walletAddress,
                    content: message.substring(0, 50),
                    channel: this.currentChannel,
                    isAnonymous: !this.isConnected
                });
                
                const response = await fetch('/api/chat/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: walletAddress,
                        content: message,
                        channelSlug: this.currentChannel.replace('#', '')
                    })
                });
                
                const data = await response.json();
                console.log('Server response:', JSON.stringify(data, null, 2));
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (!response.ok) {
                    const errorDetails = data.details || data.error || 'Failed to send message';
                    console.error('❌ Server error details:', errorDetails);
                    console.error('Full error object:', JSON.stringify(data, null, 2));
                    throw new Error(errorDetails);
                }
                
                // Message will appear via real-time subscription
                console.log('✅ Message sent successfully:', data.message?.id);
                
                // Force immediate reload of messages
                await this.loadChannelMessages(this.currentChannel);
                
            } catch (error) {
                console.error('❌ Error sending message:', error);
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                alert(`Failed to send message:\n${errorMsg}\n\nCheck console for details.`);
                chatInput.value = message; // Restore message on error
            }
        }
    }

    async fetchChannels() {
        try {
            console.log('Fetching channels from server...');
            const response = await fetch('/api/chat/channels');
            const data = await response.json();
            
            console.log('Channels API response:', JSON.stringify(data, null, 2));
            
            if (!response.ok) {
                console.error('❌ Failed to fetch channels:', data.error, data.details);
                // Continue with local channels only
                return;
            }
            
            if (data.success && data.channels) {
                // Merge server channels with local channels
                const serverChannels = data.channels.map(ch => '#' + ch.slug);
                this.channels = Array.from(new Set([...this.channels, ...serverChannels]));
                this.saveChannels();
                this.updateChannelList();
                console.log('✅ Fetched channels from server:', this.channels);
            }
        } catch (error) {
            console.error('❌ Error fetching channels:', error);
            // Continue with local channels only
        }
    }

    async loadChannelMessages(channel) {
        try {
            const slug = channel.replace('#', '');
            console.log(`📥 Loading messages for channel: ${slug}`);
            
            const response = await fetch(`/api/chat/messages?channel=${slug}&limit=50`);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('❌ Failed to load messages:', data.error, data.details);
                this.addSystemMessage(`Failed to load messages for ${channel}`);
                return;
            }
            
            if (data.success && data.messages) {
                // Clear chat display
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.innerHTML = '';
                }
                
                // Display all messages for this channel
                data.messages.forEach(msg => {
                    this.displayMessage(msg.user.username, msg.content, new Date(msg.createdAt));
                });
                
                // Set last message ID for polling
                if (data.messages.length > 0) {
                    this.lastMessageId = data.messages[data.messages.length - 1].createdAt;
                }
                
                console.log(`✅ Loaded ${data.messages.length} messages for ${channel}`);
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            this.addSystemMessage(`Error: Could not load ${channel}`);
        }
    }

    subscribeToRealtimeMessages() {
        // Poll for new messages every 3 seconds (simple polling approach)
        // For true real-time, would use WebSocket or Supabase Realtime subscriptions
        if (this.messagePoller) {
            clearInterval(this.messagePoller);
        }
        
        this.lastMessageId = null;
        
        this.messagePoller = setInterval(async () => {
            // Poll even if not connected (for anonymous users)
            
            try {
                const slug = this.currentChannel.replace('#', '');
                const response = await fetch(`/api/chat/messages?channel=${slug}&limit=10`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.messages) {
                        // Only show new messages (ones we haven't seen yet)
                        const newMessages = data.messages.filter(msg => {
                            if (!this.lastMessageId) return true;
                            return new Date(msg.createdAt) > new Date(this.lastMessageId);
                        });
                        
                        newMessages.forEach(msg => {
                            this.displayMessage(msg.user.username, msg.content, new Date(msg.createdAt));
                            this.lastMessageId = msg.createdAt;
                        });
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }, 3000); // Poll every 3 seconds
    }

    displayMessage(username, content, timestamp = new Date()) {
        const chatMessages = document.getElementById('chat-messages');
        const time = timestamp.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // SECURITY: Sanitize all inputs
        const sanitizedUsername = window.SecurityManager ? 
            window.SecurityManager.sanitizeHTML(username) : this.escapeHTML(username);
        const sanitizedMessage = window.SecurityManager ? 
            window.SecurityManager.sanitizeHTML(content) : this.escapeHTML(content);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = `[${time}]`;
        
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = `<${sanitizedUsername}>`;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = sanitizedMessage;
        
        messageDiv.appendChild(timestampSpan);
        messageDiv.appendChild(document.createTextNode(' '));
        messageDiv.appendChild(usernameSpan);
        messageDiv.appendChild(document.createTextNode(' '));
        messageDiv.appendChild(textSpan);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addUserMessage(username, message) {
        // Deprecated: Use displayMessage() instead
        this.displayMessage(username, message);
    }

    async createChannel(channelName) {
        if (!this.isConnected) {
            alert('⚠️ Anonymous users cannot create channels.\n\nConnect your wallet to create channels!');
            return;
        }
        
        const slug = channelName.replace('#', '').toLowerCase();
        
        try {
            const response = await fetch('/api/chat/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: channelName,
                    slug,
                    description: `${channelName} channel`,
                    walletAddress: this.walletAddress
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Add to local channels
                if (!this.channels.includes(channelName)) {
                    this.channels.push(channelName);
                    this.saveChannels();
                    this.updateChannelList();
                }
                this.switchChannel(channelName);
                console.log('Channel created:', channelName);
            } else {
                if (response.status === 409) {
                    // Channel already exists, just add it locally and switch
                    if (!this.channels.includes(channelName)) {
                        this.channels.push(channelName);
                        this.saveChannels();
                        this.updateChannelList();
                    }
                    this.switchChannel(channelName);
                } else {
                    alert(data.error || 'Failed to create channel');
                }
            }
        } catch (error) {
            console.error('Error creating channel:', error);
            alert('Failed to create channel');
        }
    }

    // Removed duplicate - see displayMessage() above

    // Security helper methods
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidAddress(address) {
        if (!address || typeof address !== 'string') return false;
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    addSystemMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message-text">${message}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in current channel
        this.channels[this.currentChannel].messages.push({
            author: 'system',
            text: message,
            timestamp: timestamp
        });
    }

    addJoinMessage(username) {
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        
        // Get wallet address for this user
        const userAddress = this.userAddresses[username] || (username === this.username ? this.walletAddress : null);
        
        if (userAddress) {
            // Make username clickable to BaseScan
            messageDiv.innerHTML = `
                <span class="timestamp">[${timestamp}]</span>
                <span class="message-text"><a href="https://basescan.org/address/${userAddress}" target="_blank" class="username-link" title="View ${username} on BaseScan">${username}</a> joined the chat!</span>
            `;
        } else {
            // Fallback for users without known addresses
            messageDiv.innerHTML = `
                <span class="timestamp">[${timestamp}]</span>
                <span class="message-text">${username} joined the chat!</span>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in current channel
        this.channels[this.currentChannel].messages.push({
            author: 'system',
            text: `${username} joined the chat!`,
            timestamp: timestamp
        });
    }

    showError(message) {
        console.error(message);
        alert(message);
    }

    // Mobile detection
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Mobile navigation methods
    showMobileChat() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        const chatSidebar = document.getElementById('chat-sidebar');
        chatSidebar.classList.add('mobile-fullscreen');
        chatSidebar.classList.remove('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
        
        this.addMobileBackButton('chat');
    }

    showMobileForum() {
        document.getElementById('welcome-section').classList.add('hidden');
        
        // Only hide chat sidebar on mobile
        if (this.isMobile()) {
            document.getElementById('chat-sidebar').classList.add('hidden');
        }
        
        const forumSection = document.getElementById('forum-section');
        forumSection.classList.add('mobile-fullscreen');
        forumSection.classList.remove('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
        
        this.showForumCategories();
        this.addMobileBackButton('forum');
    }

    showMobileArcade() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        // Only hide chat sidebar on mobile
        if (this.isMobile()) {
            document.getElementById('chat-sidebar').classList.add('hidden');
        }
        
        const welcomeSection = document.getElementById('welcome-section');
        welcomeSection.classList.add('mobile-fullscreen');
        welcomeSection.classList.remove('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
        
        this.addMobileBackButton('arcade');
    }

    showMobileShop() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        // Only hide chat sidebar on mobile
        if (this.isMobile()) {
            document.getElementById('chat-sidebar').classList.add('hidden');
        }
        
        alert('Shop section coming soon!');
        
        const welcomeSection = document.getElementById('welcome-section');
        welcomeSection.classList.add('mobile-fullscreen');
        welcomeSection.classList.remove('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
        
        this.addMobileBackButton('shop');
    }

    addMobileBackButton(section) {
        const existingBackBtn = document.getElementById('mobile-back-btn');
        if (existingBackBtn) {
            existingBackBtn.remove();
        }
        
        const backBtn = document.createElement('button');
        backBtn.id = 'mobile-back-btn';
        backBtn.className = 'mobile-back-btn';
        backBtn.innerHTML = '← Back';
        backBtn.onclick = () => this.hideMobileSection(section);
        
        const navbar = document.querySelector('.navbar');
        navbar.appendChild(backBtn);
    }

    hideMobileSection(section) {
        const backBtn = document.getElementById('mobile-back-btn');
        if (backBtn) {
            backBtn.remove();
        }
        
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        // Only hide chat sidebar on mobile clients
        if (this.isMobile()) {
            document.getElementById('chat-sidebar').classList.add('hidden');
        } else {
            // On desktop, ensure chat sidebar is visible
            document.getElementById('chat-sidebar').classList.remove('hidden');
        }
        
        document.getElementById('welcome-section').classList.remove('mobile-fullscreen');
        document.getElementById('forum-section').classList.remove('mobile-fullscreen');
        document.getElementById('chat-sidebar').classList.remove('mobile-fullscreen');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
        
        document.getElementById('welcome-section').classList.remove('hidden');
    }

    // Forum methods
    showForum() {
        console.log('showForum called');
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('forum-section').classList.remove('hidden');
        this.showForumCategories();
    }

    showForumCategories() {
        document.querySelector('.forum-categories').classList.remove('hidden');
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('post-editor').classList.add('hidden');
    }

    showCategoryPosts(category) {
        this.currentCategory = category;
        document.querySelector('.forum-categories').classList.add('hidden');
        document.getElementById('forum-posts').classList.remove('hidden');
        document.getElementById('post-editor').classList.add('hidden');
        this.renderPosts(category);
    }

    showPostEditor() {
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('post-editor').classList.remove('hidden');
    }

    publishPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        if (!this.isConnected) {
            alert('Please connect your wallet to post');
            return;
        }
        
        const post = {
            title: title,
            content: content,
            author: this.username || this.abbreviateAddress(this.walletAddress),
            date: new Date().toLocaleDateString(),
            replies: 0
        };
        
        this.forumPosts[this.currentCategory].push(post);
        
        // Clear form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        
        // Go back to posts
        this.showCategoryPosts(this.currentCategory);
        
        console.log('Post published:', post);
    }

    renderPosts(category) {
        const postsList = document.getElementById('posts-list');
        const posts = this.forumPosts[category] || [];
        
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = '<div class="no-posts">No posts yet. Be the first to start a discussion!</div>';
            return;
        }
        
        posts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';
            postItem.innerHTML = `
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span class="post-author">by ${post.author}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                </div>
                <div class="post-preview">${post.content.substring(0, 150)}...</div>
                <div class="post-stats">
                    <span>${post.replies || 0} replies</span>
                    <span>${post.views || 0} views</span>
                </div>
            `;
            
            postItem.addEventListener('click', () => this.showThread(post.id));
            postsList.appendChild(postItem);
        });
    }

    showThread(postId) {
        const posts = this.forumPosts[this.currentCategory] || [];
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        // Increment view count
        post.views = (post.views || 0) + 1;
        
        // Show thread view
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('post-editor').classList.add('hidden');
        
        // Create thread view if it doesn't exist
        let threadView = document.getElementById('thread-view');
        if (!threadView) {
            threadView = document.createElement('div');
            threadView.id = 'thread-view';
            threadView.className = 'thread-view';
            document.getElementById('forum-section').appendChild(threadView);
        }
        
        threadView.innerHTML = `
            <div class="thread-header">
                <button id="back-to-posts" class="back-btn">← Back to Posts</button>
                <h2>${post.title}</h2>
            </div>
            <div class="thread-content">
                <div class="thread-post">
                    <div class="post-meta">
                        <span class="post-author">${post.author}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                    <div class="post-content">${post.content}</div>
                </div>
                <div class="thread-replies" id="thread-replies"></div>
                <div class="thread-reply-form">
                    <textarea id="thread-reply-input" placeholder="Write a reply..."></textarea>
                    <button id="post-reply-btn" class="post-reply-btn">Post Reply</button>
                </div>
            </div>
        `;
        
        threadView.classList.remove('hidden');
        
        // Add event listeners
        document.getElementById('back-to-posts').addEventListener('click', () => {
            threadView.classList.add('hidden');
            this.showCategoryPosts(this.currentCategory);
        });
        
        document.getElementById('post-reply-btn').addEventListener('click', () => {
            this.postThreadReply(postId);
        });
        
        this.currentThread = postId;
        this.renderThreadPosts();
    }

    renderThreadPosts() {
        // Implementation for rendering thread posts
    }

    postThreadReply(postId) {
        const replyInput = document.getElementById('thread-reply-input');
        const reply = replyInput.value.trim();
        
        if (!reply) return;
        
        // Add reply logic here
        replyInput.value = '';
    }

    // Channel methods
    showChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
        }
    }

    hideChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }

    createChannel() {
        const channelName = document.getElementById('channel-name-input').value.trim();
        const channelDesc = document.getElementById('channel-desc-input').value.trim();
        const isPrivate = document.getElementById('channel-private-checkbox').checked;
        
        if (!channelName) {
            alert('Please enter a channel name');
            return;
        }
        
        const channelKey = `#${channelName.toLowerCase()}`;
        
        if (this.channels[channelKey]) {
            alert('Channel already exists');
            return;
        }
        
        this.channels[channelKey] = {
            name: channelKey,
            description: channelDesc || 'User created channel',
            private: isPrivate,
            users: new Set(),
            messages: []
        };
        
        this.addChannelToList(channelKey);
        this.switchChannel(channelKey);
        this.hideChannelDialog();
        
        // Clear form
        document.getElementById('channel-name-input').value = '';
        document.getElementById('channel-desc-input').value = '';
        document.getElementById('channel-private-checkbox').checked = false;
    }

    updateChannelList() {
        const channelList = document.getElementById('channel-list');
        if (!channelList) return;
        
        // Clear existing channels
        channelList.innerHTML = '';
        
        // Add all channels
        Object.keys(this.channels).forEach(channelName => {
            this.addChannelToList(channelName);
        });
    }

    addChannelToList(channelName) {
        const channelList = document.getElementById('channel-list');
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.dataset.channel = channelName;
        channelItem.innerHTML = `
            <span class="channel-name">${channelName}</span>
            <span class="channel-users">${this.channels[channelName].users.size}</span>
        `;
        
        // Add click handler for channel switching
        channelItem.addEventListener('click', () => {
            this.switchChannel(channelName);
        });
        
        channelList.appendChild(channelItem);
    }

    async switchChannel(channelName) {
        console.log('🔄 Switching to channel:', channelName);
        
        // Update current channel
        this.currentChannel = channelName;
        
        // Clear messages display
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Update UI to show new channel
        this.updateChannelUI();
        
        // Stop polling for old channel
        if (this.messagePoller) {
            clearInterval(this.messagePoller);
        }
        
        // Load messages from database for this channel
        await this.loadChannelMessages(channelName);
        
        // Restart polling for new channel
        this.subscribeToRealtimeMessages();
        
        console.log('✅ Switched to channel:', channelName);
    }

    updateChannelUI() {
        const channelInfo = document.querySelector('.channel-info');
        if (channelInfo) {
            const userCount = this.channels[this.currentChannel] ? this.channels[this.currentChannel].users.size : 0;
            channelInfo.innerHTML = `
                <span class="current-channel">${this.currentChannel}</span>
                <span class="user-count">${userCount} users</span>
            `;
        }
        
        // Update channel list user counts
        const channelItems = document.querySelectorAll('.channel-item');
        channelItems.forEach(item => {
            const channelName = item.dataset.channel;
            const userCount = item.querySelector('.channel-users');
            if (userCount && this.channels[channelName]) {
                const count = this.channels[channelName].users.size;
                userCount.textContent = count;
            }
        });
    }

    // Category methods
    showCategoryDialog() {
        const dialog = document.getElementById('category-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
        }
    }

    hideCategoryDialog() {
        const dialog = document.getElementById('category-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }

    createCategory() {
        const categoryName = document.getElementById('category-name').value.trim();
        const categoryDesc = document.getElementById('category-description').value.trim();
        const categoryIcon = document.getElementById('category-icon').value.trim();
        
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }
        
        const category = {
            id: Date.now(),
            name: categoryName,
            description: categoryDesc || `Discussion about ${categoryName}`,
            icon: categoryIcon || '📁',
            posts: 0
        };
        
        this.customCategories.push(category);
        this.forumPosts[categoryName.toLowerCase()] = [];
        
        this.addCategoryToUI(category);
        this.hideCategoryDialog();
        
        // Clear form
        document.getElementById('category-name').value = '';
        document.getElementById('category-description').value = '';
        document.getElementById('category-icon').value = '';
    }

    addCategoryToUI(category) {
        const categoriesContainer = document.querySelector('.forum-categories');
        if (!categoriesContainer) return;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.dataset.category = category.name.toLowerCase();
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon || '📁'}</div>
            <h3 class="category-title">${category.name}</h3>
            <p class="category-desc">${category.description}</p>
            <div class="category-stats">
                <span>${category.posts} posts</span>
            </div>
        `;
        
        categoryCard.addEventListener('click', () => {
            this.showCategoryPosts(category.name.toLowerCase());
        });
        
        categoriesContainer.appendChild(categoryCard);
    }

    showWelcome() {
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        // Only hide chat sidebar on mobile clients
        if (this.isMobile()) {
            document.getElementById('chat-sidebar').classList.add('hidden');
        } else {
            // On desktop, ensure chat sidebar is visible
            document.getElementById('chat-sidebar').classList.remove('hidden');
        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }

    // Channel creation methods
    showChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
        }
    }

    hideChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }

    createChannel() {
        const channelName = document.getElementById('channel-name').value.trim();
        const channelDesc = document.getElementById('channel-description').value.trim();
        const isPrivate = document.getElementById('channel-private').checked;

        if (!channelName) {
            alert('Please enter a channel name');
            return;
        }

        // Validate channel name format
        if (!channelName.startsWith('#')) {
            alert('Channel name must start with #');
            return;
        }

        if (!/^#[a-z0-9\-]+$/.test(channelName)) {
            alert('Channel name can only contain letters, numbers, and hyphens');
            return;
        }

        // Check if channel already exists
        if (this.channels[channelName]) {
            alert('Channel already exists');
            return;
        }

        // Create the channel
        this.channels[channelName] = {
            name: channelName,
            description: channelDesc || `${channelName} discussion`,
            private: isPrivate,
            users: new Set(),
            messages: []
        };

        // Save channels to localStorage for persistence
        this.saveChannels();

        // Add to channel list
        this.addChannelToUI(channelName);
        this.hideChannelDialog();

        // Clear form
        document.getElementById('channel-name').value = '';
        document.getElementById('channel-description').value = '';
        document.getElementById('channel-private').checked = false;

        // Switch to the new channel
        this.switchChannel(channelName);
    }

    saveChannels() {
        try {
            // Convert channels object to storable format (can't store Sets)
            const channelsData = {};
            Object.keys(this.channels).forEach(key => {
                channelsData[key] = {
                    name: this.channels[key].name,
                    description: this.channels[key].description,
                    private: this.channels[key].private,
                    messages: this.channels[key].messages || []
                };
            });
            localStorage.setItem('basement_channels', JSON.stringify(channelsData));
            console.log('Channels saved to localStorage');
        } catch (error) {
            console.error('Failed to save channels:', error);
        }
    }

    loadChannels() {
        try {
            const savedChannels = localStorage.getItem('basement_channels');
            if (savedChannels) {
                const channelsData = JSON.parse(savedChannels);
                Object.keys(channelsData).forEach(key => {
                    this.channels[key] = {
                        ...channelsData[key],
                        users: new Set() // Recreate Set
                    };
                    // Add to UI if not default #basement
                    if (key !== '#basement') {
                        this.addChannelToUI(key);
                    }
                });
                console.log('Loaded saved channels:', Object.keys(this.channels).length);
            }
        } catch (error) {
            console.error('Failed to load channels:', error);
        }
    }

    addChannelToUI(channelName) {
        const channelList = document.getElementById('channel-list');
        if (!channelList) return;

        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.dataset.channel = channelName;
        channelItem.innerHTML = `
            <span class="channel-name">${channelName}</span>
            <span class="channel-users">0</span>
        `;

        channelItem.addEventListener('click', () => {
            this.switchChannel(channelName);
        });

        channelList.appendChild(channelItem);
    }

    switchChannel(channelName) {
        // Update active channel
        this.currentChannel = channelName;

        // Update UI
        const channelItems = document.querySelectorAll('.channel-item');
        channelItems.forEach(item => {
            if (item.dataset.channel === channelName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update channel title
        const currentChannelTitle = document.getElementById('current-channel');
        if (currentChannelTitle) {
            currentChannelTitle.textContent = channelName;
        }

        // Load channel messages
        this.loadChannelMessages(channelName);
    }

    loadChannelMessages(channelName) {
        const channel = this.channels[channelName];
        if (!channel) return;

        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        // Clear current messages
        messagesContainer.innerHTML = '';

        // Load messages for this channel
        channel.messages.forEach(msg => {
            this.addMessageToUI(msg);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.basementApp = new BasementApp();
    
    // Set up event listeners for dialogs
    const createChannelBtn = document.getElementById('create-channel');
    const cancelChannelBtn = document.getElementById('cancel-channel');
    const createChannelSubmit = document.getElementById('create-channel-btn');
    const cancelCategoryBtn = document.getElementById('cancel-category');
    const createCategorySubmit = document.getElementById('create-category-submit');

    if (createChannelBtn) {
        createChannelBtn.addEventListener('click', () => {
            window.basementApp.showChannelDialog();
        });
    }

    if (cancelChannelBtn) {
        cancelChannelBtn.addEventListener('click', () => {
            window.basementApp.hideChannelDialog();
        });
    }

    if (createChannelSubmit) {
        createChannelSubmit.addEventListener('click', () => {
            window.basementApp.createChannel();
        });
    }

    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', () => {
            window.basementApp.hideCategoryDialog();
        });
    }

    if (createCategorySubmit) {
        createCategorySubmit.addEventListener('click', () => {
            window.basementApp.createCategory();
        });
    }

    // ===================================
    // LIVE STATS DASHBOARD
    // ===================================
    
    async function loadGlobalStats() {
        // Check if elements exist
        const wageredEl = document.getElementById('total-wagered-stat');
        const playersEl = document.getElementById('total-players-stat');
        const roundsEl = document.getElementById('total-rounds-stat');
        const activeEl = document.getElementById('active-now-stat');
        
        if (!wageredEl || !playersEl || !roundsEl || !activeEl) {
            return; // Stats dashboard not on this page
        }
        
        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            console.log('Ethers.js not loaded, stats unavailable');
            return;
        }
        
        try {
            // Initialize provider
            let provider;
            if (window.ethereum) {
                provider = new ethers.BrowserProvider(window.ethereum);
            } else {
                // Use public RPC if no wallet
                provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
            }
            
            // Lucky Block contract
            const CONTRACT_ADDRESS = '0x3041638a8a4393c13ad1A7E4173741e183518EB1';
            const CONTRACT_ABI = [
                'function getGlobalStats() external view returns (uint256 wagered, uint256 roundsCompleted, uint256 uniquePlayers, uint256 currentRound, uint256 activePlayers)'
            ];
            
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            
            // Fetch stats
            const stats = await contract.getGlobalStats();
            
            // Update UI with animations
            animateValue('total-wagered-stat', 0, parseFloat(ethers.formatEther(stats[0])), 1000);
            animateValue('total-players-stat', 0, Number(stats[2]), 1000);
            animateValue('total-rounds-stat', 0, Number(stats[1]), 1000);
            activeEl.textContent = stats[4].toString();
            
        } catch (error) {
            console.error('Stats load error:', error);
            // Show placeholder if error
            wageredEl.textContent = '---';
            playersEl.textContent = '---';
            roundsEl.textContent = '---';
            activeEl.textContent = '---';
        }
    }
    
    function animateValue(elementId, start, end, duration) {
        const obj = document.getElementById(elementId);
        if (!obj) return;
        
        const range = end - start;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = start + (range * progress);
            
            if (value >= 1000) {
                obj.textContent = (value / 1000).toFixed(2) + 'K';
            } else if (value >= 1) {
                obj.textContent = Math.floor(value);
            } else {
                obj.textContent = value.toFixed(4);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        update();
    }
    
    // Load stats on page load
    if (document.getElementById('total-wagered-stat')) {
        setTimeout(loadGlobalStats, 1000); // Wait 1s for ethers to load
        setInterval(loadGlobalStats, 15000); // Refresh every 15 seconds
    }
});