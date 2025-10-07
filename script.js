// The Basement - Retro Cyberpunk Web3 Arcade
// Base Account SDK Integration

class BasementApp {
    constructor() {
        this.baseAccount = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.customUsername = null;
        this.basename = null;
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
        
        this.init();
    }

    async init() {
        try {
            // Wait for Base Account SDK to load
            if (typeof window.createBaseAccountSDK === 'undefined') {
                console.error('Base Account SDK not loaded');
                this.showError('Base Account SDK failed to load. Please refresh the page.');
                return;
            }

            // Initialize Base Account SDK
            this.baseAccount = window.createBaseAccountSDK({
                appName: "The Basement",
                appLogoUrl: "assets/logo.png"
            });

            this.setupEventListeners();
            this.generateParticles();
            console.log('The Basement app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize The Basement app:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    generateParticles() {
        const particlesContainer = document.getElementById('particles-container');
        const particleCount = 200; // Increased from 100 to 200 for more vibey effect
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            // Random animation delays and durations
            const floatDelay = Math.random() * 6;
            const glowDelay = Math.random() * 4;
            const floatDuration = 4 + Math.random() * 4; // 4-8 seconds
            const glowDuration = 3 + Math.random() * 2; // 3-5 seconds
            
            particle.style.top = `${top}%`;
            particle.style.left = `${left}%`;
            particle.style.animationDelay = `${floatDelay}s, ${glowDelay}s`;
            particle.style.animationDuration = `${floatDuration}s, ${glowDuration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    setupEventListeners() {
        // Wallet connection
        const connectBtn = document.getElementById('connect-wallet');
        const disconnectBtn = document.getElementById('disconnect-wallet');
        const walletOptions = document.getElementById('wallet-options');
        
        connectBtn.addEventListener('click', () => this.toggleWalletDropdown());
        disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        
        // Wallet option buttons
        const walletOptionBtns = document.querySelectorAll('.wallet-option');
        walletOptionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const walletType = e.target.getAttribute('data-wallet');
                this.connectWallet(walletType);
                this.hideWalletDropdown();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.wallet-dropdown')) {
                this.hideWalletDropdown();
            }
        });

        // Profile dialog event listeners
        const dialogUploadPicBtn = document.getElementById('dialog-upload-pic');
        const skipSetupBtn = document.getElementById('skip-setup');
        const saveProfileBtn = document.getElementById('save-profile');
        const customUsernameSimple = document.getElementById('custom-username-simple');
        const profilePicInput = document.createElement('input');
        profilePicInput.type = 'file';
        profilePicInput.accept = 'image/*';
        profilePicInput.style.display = 'none';
        document.body.appendChild(profilePicInput);
        
        dialogUploadPicBtn.addEventListener('click', () => {
            profilePicInput.click();
        });
        
        profilePicInput.addEventListener('change', (e) => {
            this.handleDialogProfilePicUpload(e.target.files[0]);
        });
        
        skipSetupBtn.addEventListener('click', () => {
            this.skipProfileSetup();
        });
        
        saveProfileBtn.addEventListener('click', () => {
            this.saveProfileSetup();
        });
        
        customUsernameSimple.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveProfileSetup();
            }
        });

        // Profile picture and username editing
        const uploadProfilePicBtn = document.getElementById('upload-profile-pic');
        const editUsernameBtn = document.getElementById('edit-username');
        const navbarProfilePicInput = document.createElement('input');
        navbarProfilePicInput.type = 'file';
        navbarProfilePicInput.accept = 'image/*';
        navbarProfilePicInput.style.display = 'none';
        document.body.appendChild(navbarProfilePicInput);
        
        uploadProfilePicBtn.addEventListener('click', () => {
            navbarProfilePicInput.click();
        });
        
        navbarProfilePicInput.addEventListener('change', (e) => {
            this.handleProfilePicUpload(e.target.files[0]);
        });
        
        editUsernameBtn.addEventListener('click', () => {
            this.showProfileDialog();
        });

        // Forum navigation
        const categoryCards = document.querySelectorAll('.category-card');
        const backToCategoriesBtn = document.getElementById('back-to-categories');
        const backToPostsBtn = document.getElementById('back-to-posts');
        const createPostBtn = document.getElementById('create-post-btn');
        const cancelPostBtn = document.getElementById('cancel-post');
        const publishPostBtn = document.getElementById('publish-post');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                this.showCategoryPosts(category);
            });
        });
        
        backToCategoriesBtn.addEventListener('click', () => {
            this.showForumCategories();
        });
        
        backToPostsBtn.addEventListener('click', () => {
            this.showCategoryPosts(this.currentCategory);
        });
        
        // Thread functionality
        const postReplyBtn = document.getElementById('post-reply');
        const threadReplyInput = document.getElementById('thread-reply');
        
        postReplyBtn.addEventListener('click', () => {
            this.postThreadReply();
        });
        
        threadReplyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.postThreadReply();
            }
        });
        
        createPostBtn.addEventListener('click', () => {
            this.showPostEditor();
        });
        
        cancelPostBtn.addEventListener('click', () => {
            this.showCategoryPosts(this.currentCategory);
        });
        
        publishPostBtn.addEventListener('click', () => {
            this.publishPost();
        });

        // Channel creation
        const createChannelBtn = document.getElementById('create-channel');
        const channelDialog = document.getElementById('channel-dialog');
        const cancelChannelBtn = document.getElementById('cancel-channel');
        const createChannelSubmitBtn = document.getElementById('create-channel-btn');
        
        createChannelBtn.addEventListener('click', () => {
            this.showChannelDialog();
        });
        
        cancelChannelBtn.addEventListener('click', () => {
            this.hideChannelDialog();
        });
        
        // Channel switching
        const channelList = document.getElementById('channel-list');
        
        channelList.addEventListener('click', (e) => {
            const channelItem = e.target.closest('.channel-item');
            if (channelItem) {
                const channelName = channelItem.getAttribute('data-channel');
                this.switchChannel(channelName);
            }
        });

        // Category creation
        const createCategoryBtn = document.getElementById('create-category-btn');
        const categoryDialog = document.getElementById('category-dialog');
        const cancelCategoryBtn = document.getElementById('cancel-category');
        const createCategorySubmitBtn = document.getElementById('create-category-submit');
        
        createCategoryBtn.addEventListener('click', () => {
            this.showCategoryDialog();
        });
        
        cancelCategoryBtn.addEventListener('click', () => {
            this.hideCategoryDialog();
        });
        
        createCategorySubmitBtn.addEventListener('click', () => {
            this.createCategory();
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
                
                // Handle specific mobile navigation
                const href = link.getAttribute('href');
                if (href === '#chat') {
                    this.toggleMobileChat();
                } else if (href === '#forum') {
                    this.showForum();
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.add('hidden');
            }
        });

        // Forum navigation
        const forumLink = document.getElementById('forum-link');
        const mobileForumLink = document.getElementById('mobile-forum-link');
        
        if (forumLink) {
            forumLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForum();
            });
        }
        
        if (mobileForumLink) {
            mobileForumLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForum();
            });
        }

        // Chat functionality
        const chatInput = document.getElementById('chat-input-field');
        const sendBtn = document.getElementById('send-btn');
        const fileInput = document.getElementById('file-input');
        const fileUploadBtn = document.getElementById('file-upload-btn');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        fileUploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });
    }

    toggleWalletDropdown() {
        const walletOptions = document.getElementById('wallet-options');
        walletOptions.classList.toggle('hidden');
    }

    hideWalletDropdown() {
        const walletOptions = document.getElementById('wallet-options');
        walletOptions.classList.add('hidden');
    }

    async checkBaseName(address) {
        try {
            // Check if address has a Base Name using Base Name Service
            // This is a simplified implementation - in production you'd use the actual Base Name Service API
            const response = await fetch(`https://api.basename.org/v1/names/${address}`);
            if (response.ok) {
                const data = await response.json();
                return data.name || null;
            }
        } catch (error) {
            console.log('Base Name check failed:', error);
        }
        return null;
    }

    async showProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        const basenameSubtitle = document.getElementById('basename-subtitle');
        const walletSubtitle = document.getElementById('wallet-subtitle');
        
        // Check for Base Name
        this.basename = await this.checkBaseName(this.walletAddress);
        
        // Update subtitles
        if (this.basename) {
            basenameSubtitle.textContent = this.basename;
            document.getElementById('basename-radio').disabled = false;
        } else {
            basenameSubtitle.textContent = 'Not available';
            document.getElementById('basename-radio').disabled = true;
        }
        
        walletSubtitle.textContent = this.abbreviateAddress(this.walletAddress);
        
        // Show dialog
        dialog.classList.remove('hidden');
    }

    hideProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        dialog.classList.add('hidden');
    }

    handleDialogProfilePicUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (GIF, PNG, JPG, etc.)');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File size too large. Please select an image under 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dialogProfilePic = document.getElementById('dialog-profile-pic');
            const dialogPlaceholder = document.getElementById('dialog-profile-placeholder');
            
            dialogProfilePic.src = e.target.result;
            dialogProfilePic.style.display = 'block';
            dialogPlaceholder.style.display = 'none';
            
            this.tempProfilePic = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    saveProfileSetup() {
        const selectedType = document.querySelector('input[name="username-type"]:checked').value;
        const customUsernameInput = document.getElementById('custom-username-simple');
        
        // Set username based on selection
        switch (selectedType) {
            case 'basename':
                this.username = this.basename;
                break;
            case 'custom':
                const customValue = customUsernameInput.value.trim();
                if (customValue) {
                    this.username = customValue;
                } else {
                    alert('Please enter a custom username');
                    return;
                }
                break;
            case 'wallet':
                this.username = this.abbreviateAddress(this.walletAddress);
                break;
        }
        
        // Set profile pic if uploaded
        if (this.tempProfilePic) {
            this.profilePic = this.tempProfilePic;
        }
        
        this.hideProfileDialog();
        this.updateWalletUI();
        this.updateChatUI();
        this.addSystemMessage(`*** ${this.username} joined the channel`);
        
        // Store preferences
        localStorage.setItem(`basement_username_${this.walletAddress}`, this.username);
        if (this.profilePic) {
            localStorage.setItem(`basement_profile_${this.walletAddress}`, this.profilePic);
        }
        
        console.log('Profile setup complete:', this.username);
    }

    skipProfileSetup() {
        this.username = this.abbreviateAddress(this.walletAddress);
        this.hideProfileDialog();
        this.updateWalletUI();
        this.updateChatUI();
        this.addSystemMessage(`*** ${this.username} joined the channel`);
        
        // Store default username
        localStorage.setItem(`basement_username_${this.walletAddress}`, this.username);
        
        console.log('Profile setup skipped, using wallet address');
    }

    hideUsernameDialog() {
        const dialog = document.getElementById('username-dialog');
        dialog.classList.add('hidden');
    }

    selectUsernameOption(type) {
        const customInput = document.getElementById('custom-username-input');
        
        switch (type) {
            case 'basename':
                if (this.basename) {
                    this.customUsername = this.basename;
                    customInput.value = this.basename;
                }
                break;
            case 'custom':
                const customValue = customInput.value.trim();
                if (customValue) {
                    this.customUsername = customValue;
                }
                break;
            case 'wallet':
                this.customUsername = null; // Use wallet address
                customInput.value = '';
                break;
        }
        
        // Highlight the selected option
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`#use-${type}`).classList.add('selected');
    }

    handleProfilePicUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (GIF, PNG, JPG, etc.)');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File size too large. Please select an image under 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.profilePic = e.target.result;
            this.updateProfilePic();
            // Store profile pic in localStorage
            localStorage.setItem(`basement_profile_${this.walletAddress}`, this.profilePic);
        };
        reader.readAsDataURL(file);
    }

    updateProfilePic() {
        const profilePicImg = document.getElementById('profile-pic');
        const profilePicPlaceholder = document.getElementById('profile-pic-placeholder');
        
        if (this.profilePic) {
            profilePicImg.src = this.profilePic;
            profilePicImg.style.display = 'block';
            profilePicPlaceholder.style.display = 'none';
        } else {
            profilePicImg.style.display = 'none';
            profilePicPlaceholder.style.display = 'flex';
        }
    }

    loadUserPreferences() {
        if (this.walletAddress) {
            // Load saved username
            const savedUsername = localStorage.getItem(`basement_username_${this.walletAddress}`);
            if (savedUsername) {
                this.username = savedUsername;
            }
            
            // Load saved profile pic
            const savedProfilePic = localStorage.getItem(`basement_profile_${this.walletAddress}`);
            if (savedProfilePic) {
                this.profilePic = savedProfilePic;
                this.updateProfilePic();
            }
        }
    }

    async connectWallet(preferredWallet = null) {
        try {
            // Check for different wallet providers
            let provider = null;
            let walletType = 'unknown';

            if (preferredWallet === 'metamask') {
                if (window.ethereum && window.ethereum.isMetaMask) {
                    provider = window.ethereum;
                    walletType = 'MetaMask';
                } else {
                    throw new Error('MetaMask not detected. Please install MetaMask.');
                }
            } else if (preferredWallet === 'phantom') {
                if (window.phantom && window.phantom.solana) {
                    provider = window.phantom.solana;
                    walletType = 'Phantom';
                } else {
                    throw new Error('Phantom not detected. Please install Phantom.');
                }
            } else if (preferredWallet === 'base') {
                if (this.baseAccount && this.baseAccount.getProvider()) {
                    provider = this.baseAccount.getProvider();
                    walletType = 'Base Wallet';
                } else {
                    throw new Error('Base Wallet not detected. Please install Base Wallet.');
                }
            } else {
                // Auto-detect wallet
                // Check MetaMask first
                if (window.ethereum && window.ethereum.isMetaMask) {
                    provider = window.ethereum;
                    walletType = 'MetaMask';
                }
                // Check Coinbase Wallet
                else if (window.ethereum && window.ethereum.isCoinbaseWallet) {
                    provider = window.ethereum;
                    walletType = 'Coinbase Wallet';
                }
                // Check Phantom (Solana)
                else if (window.phantom && window.phantom.solana) {
                    provider = window.phantom.solana;
                    walletType = 'Phantom';
                }
                // Check other Solana wallets
                else if (window.solana) {
                    provider = window.solana;
                    walletType = 'Solana Wallet';
                }
                // Check Base Account SDK
                else if (this.baseAccount && this.baseAccount.getProvider()) {
                    provider = this.baseAccount.getProvider();
                    walletType = 'Base Wallet';
                }
                // Generic ethereum provider
                else if (window.ethereum) {
                    provider = window.ethereum;
                    walletType = 'Ethereum Wallet';
                }
            }

            if (!provider) {
                throw new Error('No wallet provider detected. Please install MetaMask, Phantom, Coinbase Wallet, or another Base-compatible wallet.');
            }

            console.log('Detected wallet:', walletType, provider);

            // Handle different wallet types
            let accounts = [];
            
            if (walletType === 'Phantom' || walletType === 'Solana Wallet') {
                // Handle Solana wallets
                try {
                    const response = await provider.connect();
                    accounts = [{ address: response.publicKey.toString() }];
                } catch (e) {
                    console.error('Solana connection error:', e);
                    throw new Error('Failed to connect to Solana wallet');
                }
            } else {
                // Handle Ethereum-based wallets
                try {
                    const result = await provider.request({ method: "eth_requestAccounts" });
                    accounts = result.map(addr => ({ address: addr }));
                } catch (e) {
                    console.error('Ethereum connection error:', e);
                    // Try alternative method
                    try {
                        const result = await provider.request({ method: "wallet_connect" });
                        accounts = result.accounts || [];
                    } catch (e2) {
                        throw new Error('Failed to connect to wallet');
                    }
                }
            }
            
            if (accounts && accounts.length > 0) {
                this.isConnected = true;
                this.walletAddress = accounts[0].address;
                this.walletType = walletType;
                
                // Verify wallet ownership by signing a message
                try {
                    const message = `Welcome to The Basement!\n\nPlease sign this message to verify your wallet ownership.\n\nTimestamp: ${Date.now()}`;
                    
                    if (walletType === 'Phantom' || walletType === 'Solana Wallet') {
                        // For Solana wallets, use different signing method
                        const encodedMessage = new TextEncoder().encode(message);
                        const signature = await provider.signMessage(encodedMessage);
                        console.log('Solana signature verified:', signature);
                    } else {
                        // For Ethereum wallets, use personal_sign
                        const signature = await provider.request({
                            method: 'personal_sign',
                            params: [message, this.walletAddress]
                        });
                        console.log('Ethereum signature verified:', signature);
                    }
                } catch (signError) {
                    console.warn('Message signing failed, proceeding without verification:', signError);
                    // Continue without signature verification for now
                }
                
                // Check if this is a returning user
                const savedUsername = localStorage.getItem(`basement_username_${this.walletAddress}`);
                if (savedUsername && !this.isFirstConnection) {
                    this.username = savedUsername;
                    this.loadUserPreferences();
                    this.updateWalletUI();
                    this.updateChatUI();
                    this.addSystemMessage(`*** ${this.username} joined the channel`);
                } else {
                    // First time connecting or no saved username - show dialog
                    this.showProfileDialog();
                }
                
                console.log('Wallet connected:', this.walletAddress, 'Type:', walletType);
            } else {
                throw new Error('No accounts returned from wallet');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            
            let errorMessage = error.message;
            if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
                errorMessage = 'Connection cancelled by user';
            } else if (error.message.includes('provider') || error.message.includes('detected')) {
                errorMessage = '⚠️ No wallet detected — please install MetaMask, Phantom, Coinbase Wallet, or another Base-compatible wallet';
            } else if (error.message.includes('network')) {
                errorMessage = '⚠️ Please switch to Base network in your wallet';
            }
            
            alert(`Connection failed: ${errorMessage}`);
        }
    }

    disconnectWallet() {
        if (this.isConnected) {
            this.addSystemMessage(`*** ${this.username} left the channel`);
        }
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.customUsername = null;
        this.basename = null;
        this.profilePic = null;
        this.isFirstConnection = false;
        this.updateWalletUI();
        this.updateChatUI();
        console.log('Wallet disconnected');
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');

        if (this.isConnected) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            
            // Show full wallet address for BaseScan verification, but display username if set
            const displayText = this.username || this.walletAddress;
            walletAddress.innerHTML = `
                <span class="wallet-display">${displayText}</span>
                <a href="https://basescan.org/address/${this.walletAddress}" target="_blank" class="wallet-address-link" title="View on BaseScan: ${this.walletAddress}">
                    <span class="basescan-icon">🔍</span>
                </a>
            `;
            walletAddress.classList.add('connected');
            
            // Update profile picture
            this.updateProfilePic();
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
            walletAddress.classList.remove('connected');
        }
    }

    abbreviateAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('chat-sidebar');
        const toggleBtn = document.getElementById('toggle-sidebar');
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.textContent = '>>';
        } else {
            sidebar.classList.remove('collapsed');
            toggleBtn.textContent = '<<';
        }
    }

    updateChatUI() {
        const chatInput = document.getElementById('chat-input-field');
        const sendBtn = document.getElementById('send-btn');
        const fileUploadBtn = document.getElementById('file-upload-btn');
        
        if (this.isConnected) {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            fileUploadBtn.disabled = false;
            chatInput.placeholder = `Type message as ${this.username}...`;
        } else {
            chatInput.disabled = true;
            sendBtn.disabled = true;
            fileUploadBtn.disabled = true;
            chatInput.placeholder = 'Connect wallet to chat...';
        }
    }

    generateUsername(address) {
        // Generate a retro username from wallet address
        const hash = address.slice(2, 8); // Take first 6 chars after 0x
        const prefixes = ['Cyber', 'Neo', 'Pixel', 'Byte', 'Code', 'Hack', 'Glitch', 'Voxel'];
        const suffixes = ['Master', 'Lord', 'King', 'Ninja', 'Ghost', 'Shadow', 'Storm', 'Fire'];
        
        const prefix = prefixes[parseInt(hash.slice(0, 2), 16) % prefixes.length];
        const suffix = suffixes[parseInt(hash.slice(2, 4), 16) % suffixes.length];
        const number = parseInt(hash.slice(4, 6), 16) % 99 + 1;
        
        return `${prefix}${suffix}${number}`;
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
            <span class="system-text">${message}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in current channel
        this.channels[this.currentChannel].messages.push({
            type: 'system',
            text: message,
            timestamp: timestamp
        });
    }

    addUserMessage(username, message) {
        if (!this.isConnected) return;
        
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        
        // Make username clickable if it's the current user
        let usernameDisplay = username;
        if (username === this.username && this.walletAddress) {
            usernameDisplay = `<a href="https://basescan.org/address/${this.walletAddress}" target="_blank" class="username-link">${username}</a>`;
        }
        
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="username">&lt;${usernameDisplay}&gt;</span>
            <span class="message-text">${message}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store message in current channel
        this.channels[this.currentChannel].messages.push({
            type: 'user',
            author: username,
            text: message,
            timestamp: timestamp
        });
    }

    goHome() {
        // Scroll to top and reset any state
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Show welcome section, hide forum
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('forum-section').classList.add('hidden');
        
        // Add a system message
        this.addSystemMessage('*** Welcome home to The Basement');
        
        // Focus on main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleMobileChat() {
        const chatSidebar = document.getElementById('chat-sidebar');
        if (chatSidebar.classList.contains('mobile-visible')) {
            chatSidebar.classList.remove('mobile-visible');
        } else {
            chatSidebar.classList.add('mobile-visible');
        }
    }

    showForumCategories() {
        document.querySelector('.forum-categories').classList.remove('hidden');
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('post-editor').classList.add('hidden');
    }

    showCategoryPosts(category) {
        this.currentCategory = category;
        const categoryNames = {
            general: 'General Discussion',
            gaming: 'Gaming',
            tech: 'Technology',
            nft: 'NFTs & Art'
        };
        
        document.getElementById('posts-title').textContent = categoryNames[category];
        document.querySelector('.forum-categories').classList.add('hidden');
        document.getElementById('forum-posts').classList.remove('hidden');
        document.getElementById('post-editor').classList.add('hidden');
        document.getElementById('thread-view').classList.add('hidden');
        
        this.renderPosts(category);
    }

    showPostEditor() {
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('post-editor').classList.remove('hidden');
        
        // Clear form
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
    }

    renderPosts(category) {
        const postsList = document.getElementById('posts-list');
        const posts = this.forumPosts[category];
        
        if (posts.length === 0) {
            postsList.innerHTML = '<div class="no-posts">No threads yet. Be the first to start a discussion!</div>';
            return;
        }
        
        postsList.innerHTML = posts.map(post => `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-item-header">
                    <div class="post-item-title">${post.title}</div>
                </div>
                <div class="post-item-meta">
                    <span class="post-item-author">by ${post.author}</span>
                    <span class="post-item-date">${post.date}</span>
                </div>
                <div class="post-item-preview">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
                <div class="post-item-stats">
                    <span class="post-replies">${post.replies || 0} replies</span>
                    <span class="post-views">${post.views || 0} views</span>
                </div>
                <div class="post-item-footer">
                    <div class="post-last-reply">
                        ${post.lastReply ? `Last reply by <span class="post-last-author">${post.lastReply.author}</span> <span class="post-last-date">${post.lastReply.date}</span>` : 'No replies yet'}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to post items
        postsList.querySelectorAll('.post-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = parseInt(item.getAttribute('data-post-id'));
                this.showThread(postId);
            });
        });
    }

    publishPost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        if (!this.isConnected) {
            alert('Please connect your wallet to create posts');
            return;
        }
        
        const post = {
            id: Date.now(),
            title: title,
            content: content,
            author: this.username || 'Anonymous',
            date: new Date().toLocaleDateString(),
            category: this.currentCategory,
            replies: [],
            views: 0,
            lastReply: null
        };
        
        this.forumPosts[this.currentCategory].unshift(post);
        this.showCategoryPosts(this.currentCategory);
        
        // Add system message
        this.addSystemMessage(`*** ${this.username} created a new thread in ${this.currentCategory}`);
        
        console.log('Thread created:', post);
    }

    showThread(postId) {
        const post = this.forumPosts[this.currentCategory].find(p => p.id === postId);
        if (!post) return;
        
        this.currentThread = post;
        
        // Hide posts list, show thread view
        document.getElementById('forum-posts').classList.add('hidden');
        document.getElementById('thread-view').classList.remove('hidden');
        
        // Update thread title
        document.getElementById('thread-title').textContent = post.title;
        
        // Render thread posts
        this.renderThreadPosts();
        
        // Increment view count
        post.views = (post.views || 0) + 1;
    }

    renderThreadPosts() {
        const threadContent = document.getElementById('thread-content');
        const post = this.currentThread;
        
        if (!post) return;
        
        // Create main post
        const mainPost = `
            <div class="thread-post">
                <div class="thread-post-header">
                    <div class="thread-post-author">
                        <div class="thread-author-avatar">👤</div>
                        <div class="thread-author-info">
                            <div class="thread-author-name">${post.author}</div>
                            <div class="thread-post-date">${post.date}</div>
                        </div>
                    </div>
                    <div class="thread-post-number">#1</div>
                </div>
                <div class="thread-post-content">${post.content}</div>
            </div>
        `;
        
        // Create reply posts
        const replies = post.replies.map((reply, index) => `
            <div class="thread-post">
                <div class="thread-post-header">
                    <div class="thread-post-author">
                        <div class="thread-author-avatar">👤</div>
                        <div class="thread-author-info">
                            <div class="thread-author-name">${reply.author}</div>
                            <div class="thread-post-date">${reply.date}</div>
                        </div>
                    </div>
                    <div class="thread-post-number">#${index + 2}</div>
                </div>
                <div class="thread-post-content">${reply.content}</div>
            </div>
        `).join('');
        
        threadContent.innerHTML = mainPost + replies;
    }

    postThreadReply() {
        const replyContent = document.getElementById('thread-reply').value.trim();
        
        if (!replyContent) {
            alert('Please enter a reply');
            return;
        }
        
        if (!this.isConnected) {
            alert('Please connect your wallet to reply');
            return;
        }
        
        const reply = {
            author: this.username || 'Anonymous',
            content: replyContent,
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.currentThread.replies.push(reply);
        this.currentThread.lastReply = reply;
        
        // Clear reply input
        document.getElementById('thread-reply').value = '';
        
        // Re-render thread
        this.renderThreadPosts();
        
        // Add system message
        this.addSystemMessage(`*** ${this.username} replied to thread "${this.currentThread.title}"`);
        
        console.log('Reply posted:', reply);
    }

    showCategoryDialog() {
        const dialog = document.getElementById('category-dialog');
        dialog.classList.remove('hidden');
        
        // Clear form
        document.getElementById('category-name').value = '';
        document.getElementById('category-description').value = '';
        document.getElementById('category-icon').value = '';
    }

    hideCategoryDialog() {
        const dialog = document.getElementById('category-dialog');
        dialog.classList.add('hidden');
    }

    createCategory() {
        const name = document.getElementById('category-name').value.trim();
        const description = document.getElementById('category-description').value.trim();
        const icon = document.getElementById('category-icon').value.trim() || '📁';
        
        if (!name) {
            alert('Please enter a category name');
            return;
        }
        
        if (!this.isConnected) {
            alert('Please connect your wallet to create categories');
            return;
        }
        
        // Create new category
        const categoryId = name.toLowerCase().replace(/\s+/g, '_');
        const category = {
            id: categoryId,
            name: name,
            description: description || 'No description',
            icon: icon,
            posts: []
        };
        
        this.customCategories.push(category);
        this.forumPosts[categoryId] = [];
        
        // Add category to UI
        this.addCategoryToUI(category);
        this.hideCategoryDialog();
        
        // Add system message
        this.addSystemMessage(`*** ${this.username} created category "${name}"`);
        
        console.log('Category created:', category);
    }

    addCategoryToUI(category) {
        const categoriesContainer = document.querySelector('.forum-categories');
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.setAttribute('data-category', category.id);
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3 class="category-title">${category.name}</h3>
            <p class="category-desc">${category.description}</p>
            <div class="category-stats">
                <span class="post-count">0 posts</span>
                <span class="last-post">No posts yet</span>
            </div>
        `;
        categoriesContainer.appendChild(categoryCard);
        
        // Add click listener
        categoryCard.addEventListener('click', () => {
            this.showCategoryPosts(category.id);
        });
    }

    showChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        dialog.classList.remove('hidden');
        
        // Clear form
        document.getElementById('channel-name').value = '';
        document.getElementById('channel-description').value = '';
        document.getElementById('channel-private').checked = false;
    }

    hideChannelDialog() {
        const dialog = document.getElementById('channel-dialog');
        dialog.classList.add('hidden');
    }

    createChannel() {
        const name = document.getElementById('channel-name').value.trim();
        const description = document.getElementById('channel-description').value.trim();
        const isPrivate = document.getElementById('channel-private').checked;
        
        if (!name) {
            alert('Please enter a channel name');
            return;
        }
        
        if (!name.startsWith('#')) {
            alert('Channel name must start with #');
            return;
        }
        
        if (!/^#[a-zA-Z0-9-]+$/.test(name)) {
            alert('Channel name can only contain letters, numbers, and hyphens');
            return;
        }
        
        if (this.channels[name]) {
            alert('Channel already exists');
            return;
        }
        
        if (!this.isConnected) {
            alert('Please connect your wallet to create channels');
            return;
        }
        
        // Create new channel
        this.channels[name] = {
            name: name,
            description: description || 'No description',
            private: isPrivate,
            users: new Set([this.username]),
            messages: []
        };
        
        // Add channel to UI list
        this.addChannelToList(name);
        
        // Switch to new channel
        this.switchChannel(name);
        this.hideChannelDialog();
        
        // Add system message
        this.addSystemMessage(`*** ${this.username} created channel ${name}`);
        
        console.log('Channel created:', name);
    }

    addChannelToList(channelName) {
        const channelList = document.getElementById('channel-list');
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.setAttribute('data-channel', channelName);
        channelItem.innerHTML = `
            <span class="channel-name">${channelName}</span>
            <span class="channel-users">1</span>
        `;
        channelList.appendChild(channelItem);
    }

    switchChannel(channelName) {
        this.currentChannel = channelName;
        document.getElementById('current-channel').textContent = channelName;
        
        // Update active channel in list
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-channel="${channelName}"]`).classList.add('active');
        
        // Update user count
        const userCount = this.channels[channelName].users.size;
        document.getElementById('channel-stats').innerHTML = `<span class="user-count">${userCount} users</span>`;
        
        // Update user count in channel list
        const channelItem = document.querySelector(`[data-channel="${channelName}"]`);
        const userCountSpan = channelItem.querySelector('.channel-users');
        userCountSpan.textContent = userCount;
        
        // Clear and reload messages
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        
        // Add channel messages
        this.channels[channelName].messages.forEach(msg => {
            if (msg.type === 'system') {
                this.addSystemMessage(msg.text);
            } else {
                this.addUserMessage(msg.author, msg.text);
            }
        });
        
        // Add welcome message if empty
        if (this.channels[channelName].messages.length === 0) {
            this.addSystemMessage(`*** Welcome to ${channelName}`);
            if (this.channels[channelName].description !== 'No description') {
                this.addSystemMessage(`*** ${this.channels[channelName].description}`);
            }
        }
    }

    handleFileUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (GIF, PNG, JPG, etc.)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('File size too large. Please select an image under 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.sendImageMessage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    sendImageMessage(imageDataUrl, fileName) {
        if (!this.isConnected) return;
        
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="username">&lt;${this.username}&gt;</span>
            <span class="message-text">shared an image:</span>
            <br>
            <img src="${imageDataUrl}" alt="${fileName}" class="chat-image" onclick="this.style.maxWidth = this.style.maxWidth === '100%' ? '200px' : '100%'">
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear file input
        document.getElementById('file-input').value = '';
        
        // Simulate bot response with meme
        setTimeout(() => {
            const memes = [
                'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
                'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
                'https://media.giphy.com/media/26BRrSvJUa2UJYyS4/giphy.gif'
            ];
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            this.addImageMessage('BasementBot', randomMeme, 'meme.gif');
        }, 1000 + Math.random() * 2000);
    }

    addImageMessage(username, imageUrl, fileName) {
        const chatMessages = document.getElementById('chat-messages');
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="username">&lt;${username}&gt;</span>
            <span class="message-text">shared:</span>
            <br>
            <img src="${imageUrl}" alt="${fileName}" class="chat-image" onclick="this.style.maxWidth = this.style.maxWidth === '100%' ? '200px' : '100%'">
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendMessage() {
        if (!this.isConnected) return;
        
        const chatInput = document.getElementById('chat-input-field');
        const message = chatInput.value.trim();
        
        if (message) {
            this.addUserMessage(this.username, message);
            chatInput.value = '';
            
            // Simulate other users responding (for demo)
            setTimeout(() => {
                const responses = [
                    'Welcome to the basement!',
                    'Nice to see another Base user here',
                    'Anyone up for some arcade games?',
                    'The voxel graphics here are sick!',
                    'Base chain is the future!',
                    'Check out this sick meme!'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const botUsername = 'BasementBot';
                this.addUserMessage(botUsername, randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper notification system
        console.error(message);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing The Basement app...');
    window.basementApp = new BasementApp();
});

// Handle any unhandled errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.basementApp) {
        window.basementApp.showError('An unexpected error occurred. Please try again.');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.basementApp) {
        window.basementApp.showError('An unexpected error occurred. Please try again.');
    }
});