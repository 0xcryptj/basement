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
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Basement App...');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load user preferences
            this.loadUserPreferences();
            
            // Generate floating particles
            this.generateParticles();
            
            // Initialize chat
            this.initializeChat();
            
            console.log('Basement App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Basement App:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    generateParticles() {
        const particlesContainer = document.getElementById('particles-container');
        if (!particlesContainer) {
            console.error('Particles container not found');
            return;
        }
        
        const particleCount = 200;
        
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

    initializeChat() {
        console.log('Initializing chat...');
        this.addSystemMessage('Welcome to The Basement! Connect your wallet to start chatting.');
    }

    setupEventListeners() {
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
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Profile setup dialog
        const dialogUploadPic = document.getElementById('dialog-upload-pic');
        const skipSetup = document.getElementById('skip-setup');
        const saveProfile = document.getElementById('save-profile');
        const customUsernameSimple = document.getElementById('custom-username-simple');

        if (dialogUploadPic) {
            dialogUploadPic.addEventListener('change', (e) => {
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
                    document.querySelector('input[name="username-choice"][value="custom"]').checked = true;
                }
            });
        }

        // Navbar profile elements
        const editUsername = document.getElementById('edit-username');
        if (editUsername) {
            editUsername.addEventListener('click', () => this.showProfileDialog());
        }

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

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Mobile menu toggle clicked');
                mobileMenuToggle.classList.toggle('active');
                mobileMenu.classList.toggle('hidden');
            });
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
        const createChannelBtn = document.getElementById('create-channel-btn');
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

        // Forum functionality
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.showCategoryPosts(category);
            });
        });

        const backToCategoriesBtn = document.getElementById('back-to-categories');
        if (backToCategoriesBtn) {
            backToCategoriesBtn.addEventListener('click', () => this.showForumCategories());
        }

        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showPostEditor());
        }

        const cancelPostBtn = document.getElementById('cancel-post-btn');
        if (cancelPostBtn) {
            cancelPostBtn.addEventListener('click', () => this.showCategoryPosts(this.currentCategory));
        }

        const publishPostBtn = document.getElementById('publish-post-btn');
        if (publishPostBtn) {
            publishPostBtn.addEventListener('click', () => this.publishPost());
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

    async connectWallet(walletType) {
        try {
            console.log(`Connecting to ${walletType}...`);
            
            let address = null;
            
            if (walletType === 'metamask') {
                if (typeof window.ethereum !== 'undefined') {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    address = accounts[0];
                } else {
                    throw new Error('MetaMask not installed');
                }
            } else if (walletType === 'phantom') {
                if (typeof window.solana !== 'undefined') {
                    const response = await window.solana.connect();
                    address = response.publicKey.toString();
                } else {
                    throw new Error('Phantom not installed');
                }
            } else if (walletType === 'base') {
                // Simulate Base wallet connection
                address = '0x' + Math.random().toString(16).substr(2, 40);
            }
            
            if (!address) {
                throw new Error('No wallet address received');
            }
            
            this.walletAddress = address;
            this.isConnected = true;
            
            // Update UI
            this.updateWalletUI();
            
            // Show profile setup for first-time users
            if (this.isFirstConnection) {
                this.showProfileDialog();
            }
            
            // Add welcome message to chat
            this.addSystemMessage(`${this.username || 'User'} joined the chat!`);
            
            console.log('Wallet connected successfully:', address);
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            this.showError(`Failed to connect to ${walletType}: ${error.message}`);
        }
    }

    disconnectWallet() {
        if (this.isConnected) {
            this.addSystemMessage(`*** ${this.username} left the channel`);
        }
        this.isConnected = false;
        this.walletAddress = null;
        this.username = null;
        this.profilePic = null;
        this.isFirstConnection = false;
        
        // Clear localStorage
        localStorage.removeItem('basement_username');
        localStorage.removeItem('basement_profilePic');
        
        // Update UI
        this.updateWalletUI();
        
        // Hide wallet dropdown
        this.toggleWalletDropdown();
    }

    loadUserPreferences() {
        const savedUsername = localStorage.getItem('basement_username');
        const savedProfilePic = localStorage.getItem('basement_profilePic');
        
        if (savedUsername) {
            this.username = savedUsername;
        }
        
        if (savedProfilePic) {
            this.profilePic = savedProfilePic;
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        
        if (this.isConnected) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'flex';
            
            const displayText = this.username || this.walletAddress;
            walletAddress.innerHTML = `
                <span class="wallet-display">${displayText}</span>
                <a href="https://basescan.org/address/${this.walletAddress}" target="_blank" class="wallet-address-link" title="View on BaseScan: ${this.walletAddress}">
                    <span class="basescan-icon">📋</span>
                </a>
            `;
            walletAddress.classList.add('connected');
            
            this.updateProfilePic();
        } else {
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
            if (walletAddress) walletAddress.classList.remove('connected');
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
            profilePic.style.display = 'none';
            profilePicPlaceholder.style.display = 'block';
        }
    }

    showProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        if (dialog) {
            dialog.classList.remove('hidden');
            
            // Check for Base Name
            this.checkBaseName(this.walletAddress).then(basename => {
                if (basename) {
                    document.querySelector('input[name="username-choice"][value="basename"]').checked = true;
                    document.getElementById('basename-display').textContent = basename;
                } else {
                    document.querySelector('input[name="username-choice"][value="wallet"]').checked = true;
                }
            });
            
            document.getElementById('wallet-display').textContent = this.walletAddress;
        }
    }

    hideProfileDialog() {
        const dialog = document.getElementById('profile-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }

    async checkBaseName(address) {
        // Simulate Base Name API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Randomly return a Base Name for demo
                const basenames = ['cyberpunk', 'basement', 'retro', 'arcade', 'web3'];
                if (Math.random() > 0.7) {
                    resolve(basenames[Math.floor(Math.random() * basenames.length)]);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    handleDialogProfilePicUpload(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.tempProfilePic = e.target.result;
                const preview = document.getElementById('profile-preview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfileSetup() {
        const selectedChoice = document.querySelector('input[name="username-choice"]:checked');
        const customUsername = document.getElementById('custom-username-simple').value.trim();
        
        if (selectedChoice) {
            if (selectedChoice.value === 'basename') {
                this.username = document.getElementById('basename-display').textContent;
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
        
        // Save to localStorage
        localStorage.setItem('basement_username', this.username);
        if (this.profilePic) {
            localStorage.setItem('basement_profilePic', this.profilePic);
        }
        
        // Store username to address mapping
        this.userAddresses[this.username] = this.walletAddress;
        
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

    abbreviateAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    sendMessage() {
        if (!this.isConnected) return;
        
        const chatInput = document.getElementById('chat-input-field');
        const message = chatInput.value.trim();
        
        if (message) {
            this.addUserMessage(this.username, message);
            chatInput.value = '';
            
            // Simulate other users responding
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
        
        // Make username clickable if we have their address
        let usernameDisplay = username;
        const userAddress = this.userAddresses[username] || (username === this.username ? this.walletAddress : null);
        
        if (userAddress) {
            usernameDisplay = `<a href="https://basescan.org/address/${userAddress}" target="_blank" class="username-link">${username}</a>`;
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
            author: username,
            text: message,
            timestamp: timestamp
        });
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

    showError(message) {
        console.error(message);
        alert(message);
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
        document.getElementById('chat-sidebar').classList.add('hidden');
        
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
        document.getElementById('chat-sidebar').classList.add('hidden');
        
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
        document.getElementById('chat-sidebar').classList.add('hidden');
        
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
        document.getElementById('chat-sidebar').classList.add('hidden');
        
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

    publishPost() {
        const title = document.getElementById('post-title-input').value.trim();
        const content = document.getElementById('post-content-input').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }
        
        const post = {
            id: Date.now(),
            title: title,
            content: content,
            author: this.username || 'Anonymous',
            date: new Date().toLocaleDateString(),
            replies: 0,
            views: 0
        };
        
        if (!this.forumPosts[this.currentCategory]) {
            this.forumPosts[this.currentCategory] = [];
        }
        
        this.forumPosts[this.currentCategory].push(post);
        
        // Clear form
        document.getElementById('post-title-input').value = '';
        document.getElementById('post-content-input').value = '';
        
        // Show posts
        this.showCategoryPosts(this.currentCategory);
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

    addChannelToList(channelName) {
        const channelList = document.getElementById('channel-list');
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        channelItem.dataset.channel = channelName;
        channelItem.innerHTML = `
            <span class="channel-name">${channelName}</span>
            <span class="channel-users">${this.channels[channelName].users.size}</span>
        `;
        channelList.appendChild(channelItem);
    }

    switchChannel(channelName) {
        this.currentChannel = channelName;
        this.updateChannelUI();
        
        // Clear and reload messages
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        
        const messages = this.channels[channelName].messages || [];
        messages.forEach(msg => {
            if (msg.author === 'system') {
                this.addSystemMessage(msg.text);
            } else {
                this.addUserMessage(msg.author, msg.text);
            }
        });
        
        // Update user counts
        this.channels[channelName].users.add(this.username);
        this.updateChannelUI();
    }

    updateChannelUI() {
        const channelInfo = document.querySelector('.channel-info');
        if (channelInfo) {
            channelInfo.innerHTML = `
                <span class="current-channel">${this.currentChannel}</span>
                <span class="user-count">${this.channels[this.currentChannel].users.size} users</span>
            `;
        }
        
        // Update channel list user counts
        const channelItems = document.querySelectorAll('.channel-item');
        channelItems.forEach(item => {
            const channelName = item.dataset.channel;
            const userCount = item.querySelector('.channel-users');
            if (userCount && this.channels[channelName]) {
                userCount.textContent = this.channels[channelName].users.size;
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
        const categoryName = document.getElementById('category-name-input').value.trim();
        
        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }
        
        const category = {
            id: Date.now(),
            name: categoryName,
            description: `Discussion about ${categoryName}`,
            posts: 0
        };
        
        this.customCategories.push(category);
        this.forumPosts[categoryName.toLowerCase()] = [];
        
        this.addCategoryToUI(category);
        this.hideCategoryDialog();
        
        // Clear form
        document.getElementById('category-name-input').value = '';
    }

    addCategoryToUI(category) {
        const categoriesContainer = document.querySelector('.forum-categories');
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.dataset.category = category.name.toLowerCase();
        categoryCard.innerHTML = `
            <div class="category-icon">📁</div>
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
        document.getElementById('chat-sidebar').classList.add('hidden');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.basementApp = new BasementApp();
});