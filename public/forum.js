// The Basement Chan - True 4chan Architecture
// Anonymous, Ephemeral, Image-based Discussion

class BasementChan {
    constructor() {
        this.currentBoard = null;
        this.currentThread = null;
        this.sessionId = this.generateSessionId();
        
        // Board configuration (like 4chan)
        this.boards = {
            'b': { 
                name: 'Random', 
                desc: 'The random board - anything goes',
                threadLimit: 150,
                bumpLimit: 300
            },
            'g': { 
                name: 'Gaming', 
                desc: 'Retro gaming, Web3 games, arcade culture',
                threadLimit: 100,
                bumpLimit: 300
            },
            'w3': { 
                name: 'Web3', 
                desc: 'Crypto, DeFi, Base Chain discussion',
                threadLimit: 100,
                bumpLimit: 300
            },
            't': { 
                name: 'Technology', 
                desc: 'Tech discussion, coding, hacking',
                threadLimit: 100,
                bumpLimit: 300
            }
        };
        
        this.threads = this.loadThreads();
        this.postCounter = this.loadPostCounter();
        this.lastPostTime = {};
        this.postRateLimit = 30000; // 30 seconds between posts
        
        this.init();
    }

    init() {
        // Load wallet session (optional - shows name if connected)
        this.loadWalletSession();
        this.updateWalletUI();
        
        // Setup mobile menu
        this.setupMobileMenu();
        
        // Initialize demo threads if empty
        if (Object.keys(this.threads).length === 0) {
            this.createDemoThreads();
        }
        
        // Auto-prune old threads every 5 minutes
        setInterval(() => this.pruneOldThreads(), 300000);
        
        // Setup disconnect button
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
    }

    generateSessionId() {
        // Generate ephemeral session ID (like 4chan's ID system)
        const stored = sessionStorage.getItem('basement_session_id');
        if (stored) return stored;
        
        const id = Array.from({length: 8}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        sessionStorage.setItem('basement_session_id', id);
        return id;
    }

    loadWalletSession() {
        const savedWalletAddress = localStorage.getItem('basement_walletAddress');
        const savedUsername = localStorage.getItem('basement_username');
        const savedIsConnected = localStorage.getItem('basement_isConnected');
        
        if (savedWalletAddress && savedUsername && savedIsConnected === 'true') {
            this.walletAddress = savedWalletAddress;
            this.username = savedUsername;
            this.isConnected = true;
        }
    }

    updateWalletUI() {
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
        } else {
            if (walletConnectedDisplay) walletConnectedDisplay.style.display = 'none';
            if (walletNotConnected) walletNotConnected.style.display = 'block';
        }
    }

    disconnectWallet() {
        localStorage.removeItem('basement_walletAddress');
        localStorage.removeItem('basement_username');
        localStorage.removeItem('basement_profilePic');
        localStorage.removeItem('basement_isConnected');
        window.location.href = 'index.html';
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('active');
                menu.classList.toggle('hidden');
            });
            
            document.addEventListener('click', (e) => {
                if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                    toggle.classList.remove('active');
                    menu.classList.add('hidden');
                }
            });
        }
    }

    loadThreads() {
        const saved = localStorage.getItem('basement_chan_threads');
        return saved ? JSON.parse(saved) : {};
    }

    saveThreads() {
        localStorage.setItem('basement_chan_threads', JSON.stringify(this.threads));
    }

    loadPostCounter() {
        const saved = localStorage.getItem('basement_chan_post_counter');
        return saved ? parseInt(saved) : 1000000; // Start at 1 million like 4chan
    }

    savePostCounter() {
        localStorage.setItem('basement_chan_post_counter', this.postCounter.toString());
    }

    // Thread bumping system (like 4chan)
    bumpThread(board, threadId) {
        const threads = this.threads[board] || [];
        const thread = threads.find(t => t.id === threadId);
        
        if (!thread) return;
        
        // Check if thread has hit bump limit
        if (thread.replies.length >= this.boards[board].bumpLimit) {
            return; // Don't bump if at limit (sage mode auto-enabled)
        }
        
        // Update last bump time
        thread.lastBump = Date.now();
        
        // Re-sort threads by last bump time (most recent first)
        this.threads[board].sort((a, b) => b.lastBump - a.lastBump);
        
        this.saveThreads();
    }

    // Auto-prune old threads (4chan-style expiration)
    pruneOldThreads() {
        Object.keys(this.threads).forEach(boardName => {
            const board = this.boards[boardName];
            const threads = this.threads[boardName] || [];
            
            // Keep only the most recent threads up to thread limit
            if (threads.length > board.threadLimit) {
                this.threads[boardName] = threads.slice(0, board.threadLimit);
                this.saveThreads();
                console.log(`Pruned ${threads.length - board.threadLimit} old threads from /${boardName}/`);
            }
            
            // Also delete threads older than 7 days with no activity
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            this.threads[boardName] = threads.filter(t => t.lastBump > sevenDaysAgo);
        });
        
        this.saveThreads();
    }

    // Rate limiting (anti-spam)
    canPost(board) {
        const key = `${board}_${this.sessionId}`;
        const lastPost = this.lastPostTime[key] || 0;
        const now = Date.now();
        
        if (now - lastPost < this.postRateLimit) {
            const wait = Math.ceil((this.postRateLimit - (now - lastPost)) / 1000);
            return { canPost: false, wait };
        }
        
        return { canPost: true };
    }

    recordPost(board) {
        const key = `${board}_${this.sessionId}`;
        this.lastPostTime[key] = Date.now();
    }

    // Image validation - Use SecurityManager if available
    async validateImage(file) {
        if (window.SecurityManager) {
            return await window.SecurityManager.validateImage(file);
        }
        
        // Fallback validation
        if (file.size > 5 * 1024 * 1024) {
            return { valid: false, errors: ['Image too large (max 5MB)'] };
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, errors: ['Invalid image type (jpg/png/gif/webp only)'] };
        }
        
        return { valid: true, errors: [] };
    }

    createDemoThreads() {
        const demoThreads = [
            {
                board: 'b',
                subject: 'Welcome to /basement/',
                comment: '>be me\n>discover the basement\n>play arcade games all night\n>connect wallet for the first time\n>mfw actually based\n\nAnyone else here? Post your favorite game.',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000000\nbased and basement-pilled', sage: false },
                    { comment: '>>1000000\n>tfw no basement\nwhy even live', sage: false },
                    { comment: '>>1000002\njust visit the site anon\nit\'s free', sage: false }
                ]
            },
            {
                board: 'g',
                subject: 'COIN TOSS STRATEGY GENERAL /ctsg/',
                comment: 'ITT: post your coin toss strategies\n\n>inb4 it\'s random\n>inb4 just bet heads\n>inb4 git gud\n\nI\'ve been tracking patterns and I think the RNG is weighted...',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000004\n>tracking patterns in a coin flip\nngmi', sage: false },
                    { comment: '>>1000004\nalways bet on tails\ntrust me bro', sage: false },
                    { comment: '>>1000006\n>he actually thinks tails is better\nlmao', sage: false }
                ]
            },
            {
                board: 'w3',
                subject: 'BASE CHAIN GENERAL /bcg/',
                comment: 'Base Chain discussion thread.\n\nWhat are you building on Base?\n\n>The Basement is unironically the best dApp on Base\n>prove me wrong\n\nprotip: you can\'t',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000009\nBullish on $BASEMENT token\nwen airdrop?', sage: false },
                    { comment: '>>1000010\n>he thinks there will be a token\nread the tokenomics page anon', sage: false },
                    { comment: '>>1000009\nBase is the future\nETH L2s are the only real scaling solution', sage: false }
                ]
            },
            {
                board: 't',
                subject: 'LATE NIGHT CODING THREAD',
                comment: '>be me\n>3:47 AM\n>still debugging smart contract\n>finally deploys\n>gas fees $47\n>mfw\n\nWhat are you coding tonight anons?',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000013\n>tfw finally fix the bug\n>create 3 more bugs\n>such is life\n>why do I do this to myself', sage: false },
                    { comment: '>>1000013\njust use Remix anon\ntesting is free', sage: false }
                ]
            },
            {
                board: 'g',
                subject: 'CONNECT 4 AI IS CHEATING',
                comment: 'I swear the Connect 4 CPU is reading my inputs.\n\nEvery time I set up a trap it blocks it perfectly.\n\nIs the AI actually that good or am I just bad?',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000016\n>he thinks the CPU is cheating\n>he doesn\'t know it just looks for winning moves\nlmao git gud', sage: false },
                    { comment: '>>1000016\nthe CPU literally just checks:\n1. can I win?\n2. can opponent win?\n3. random move\n\nyou\'re just bad anon', sage: false },
                    { comment: '>>1000018\nthis\njust play better OP', sage: false }
                ]
            },
            {
                board: 'b',
                subject: '',
                comment: '>wake up\n>check The Basement\n>new games added\n>spend entire day playing\n>mfw it\'s 3am again\n>no regrets',
                image: null,
                sage: false,
                replies: [
                    { comment: '>>1000020\nsame anon\nsame', sage: false }
                ]
            }
        ];

        demoThreads.forEach(threadData => {
            this.createThreadFromData(threadData);
        });
    }

    createThreadFromData(data) {
        const threadId = this.postCounter++;
        const timestamp = Date.now() - Math.random() * 86400000 * 3; // Random within last 3 days
        
        const thread = {
            id: threadId,
            board: data.board,
            subject: data.subject || '',
            comment: data.comment,
            image: data.image,
            author: 'Anonymous',
            sessionId: this.generateSessionId(),
            timestamp: timestamp,
            lastBump: timestamp,
            replies: [],
            sticky: false,
            locked: false
        };

        // Add replies with bumping
        if (data.replies) {
            data.replies.forEach((replyData, index) => {
                const replyId = this.postCounter++;
                const replyTimestamp = timestamp + (index + 1) * 300000; // 5 mins apart
                
                thread.replies.push({
                    id: replyId,
                    comment: replyData.comment,
                    image: replyData.image,
                    author: 'Anonymous',
                    sessionId: this.generateSessionId(),
                    timestamp: replyTimestamp,
                    sage: replyData.sage || false
                });
                
                // Bump thread if not sage
                if (!replyData.sage) {
                    thread.lastBump = replyTimestamp;
                }
            });
        }

        if (!this.threads[data.board]) {
            this.threads[data.board] = [];
        }
        
        this.threads[data.board].push(thread);
        
        // Sort by last bump (most recent first)
        this.threads[data.board].sort((a, b) => b.lastBump - a.lastBump);
        
        this.saveThreads();
        this.savePostCounter();
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${month}/${day}/${year}(Wed)${hours}:${minutes}:${seconds}`;
    }

    parseComment(text) {
        let html = this.escapeHtml(text);
        
        // Greentext (lines starting with >)
        html = html.replace(/^&gt;([^\n]+)$/gm, '<span class="greentext">&gt;$1</span>');
        
        // Quote links (>>123456)
        html = html.replace(/&gt;&gt;(\d+)/g, '<a href="#post-$1" class="quote-link" onclick="highlightPost($1); return false;">&gt;&gt;$1</a>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getThreadStats(board) {
        const threads = this.threads[board] || [];
        const threadCount = threads.length;
        const postCount = threads.reduce((sum, t) => sum + 1 + t.replies.length, 0);
        return { threadCount, postCount };
    }
}

// Global instance
let chan;
document.addEventListener('DOMContentLoaded', () => {
    chan = new BasementChan();
    updateBoardStats();
});

// Update board statistics
function updateBoardStats() {
    Object.keys(chan.boards).forEach(boardName => {
        const stats = chan.getThreadStats(boardName);
        const boardCard = document.querySelector(`[data-board="${boardName}"]`);
        if (boardCard) {
            const threadCountEl = boardCard.querySelector('.thread-count');
            const postCountEl = boardCard.querySelector('.post-count');
            if (threadCountEl) threadCountEl.textContent = `${stats.threadCount} threads`;
            if (postCountEl) postCountEl.textContent = `${stats.postCount} posts`;
        }
    });
}

// Navigation Functions
function showBoardList() {
    document.getElementById('board-list').classList.remove('hidden');
    document.getElementById('catalog-view').classList.add('hidden');
    document.getElementById('thread-view').classList.add('hidden');
    updateBoardStats();
}

function loadBoard(boardName) {
    chan.currentBoard = boardName;
    const board = chan.boards[boardName];
    
    document.getElementById('board-list').classList.add('hidden');
    document.getElementById('catalog-view').classList.remove('hidden');
    document.getElementById('thread-view').classList.add('hidden');
    
    document.getElementById('current-board-title').textContent = `/${boardName}/ - ${board.name}`;
    
    renderCatalog(boardName);
}

function backToCatalog() {
    document.getElementById('catalog-view').classList.remove('hidden');
    document.getElementById('thread-view').classList.add('hidden');
    renderCatalog(chan.currentBoard);
}

function switchView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (view === 'catalog') {
        renderCatalog(chan.currentBoard);
    }
}

// Render Catalog (4chan-style grid)
function renderCatalog(boardName) {
    const catalog = document.getElementById('thread-catalog');
    const threads = chan.threads[boardName] || [];
    
    if (threads.length === 0) {
        catalog.innerHTML = `
            <div class="no-threads">
                <p>No threads on /${boardName}/ yet.</p>
                <p>Be the first to create one!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    threads.forEach(thread => {
        const excerpt = thread.comment.substring(0, 80).replace(/\n/g, ' ');
        const truncatedExcerpt = excerpt.length >= 80 ? excerpt + '...' : excerpt;
        const replyCount = thread.replies.length;
        const imageCount = (thread.image ? 1 : 0) + thread.replies.filter(r => r.image).length;
        
        html += `
            <div class="catalog-thread" onclick="loadThread('${boardName}', ${thread.id})">
                ${thread.image ? 
                    `<img src="${thread.image}" class="catalog-thread-image" alt="">` :
                    '<div class="catalog-thread-no-image">💬</div>'
                }
                ${thread.subject ? `<div class="catalog-thread-subject">${chan.escapeHtml(thread.subject)}</div>` : ''}
                <div class="catalog-thread-excerpt">${chan.escapeHtml(truncatedExcerpt)}</div>
                <div class="catalog-thread-meta">
                    <span>R: ${replyCount}</span>
                    <span>I: ${imageCount}</span>
                    ${replyCount >= chan.boards[boardName].bumpLimit ? '<span class="bump-limit">BUMP</span>' : ''}
                </div>
            </div>
        `;
    });
    
    catalog.innerHTML = html;
}

// Load Thread (4chan-style thread view)
function loadThread(boardName, threadId) {
    const threads = chan.threads[boardName] || [];
    const thread = threads.find(t => t.id === threadId);
    
    if (!thread) {
        alert('Thread not found');
        return;
    }
    
    chan.currentThread = thread;
    chan.currentBoard = boardName;
    
    document.getElementById('catalog-view').classList.add('hidden');
    document.getElementById('thread-view').classList.remove('hidden');
    
    document.getElementById('thread-board-name').textContent = `/${boardName}/ - ${chan.boards[boardName].name}`;
    
    renderThread(thread);
}

// Render Thread with OP and all replies
function renderThread(thread) {
    const content = document.getElementById('thread-content');
    const board = chan.boards[chan.currentBoard];
    let html = '';
    
    // Render OP post
    html += renderPost(thread, true, 0);
    
    // Render all replies
    thread.replies.forEach((reply, index) => {
        html += renderPost(reply, false, index + 1);
    });
    
    // Show bump limit warning if close
    if (thread.replies.length >= board.bumpLimit - 10) {
        html += `
            <div class="bump-warning">
                ⚠️ This thread has ${thread.replies.length}/${board.bumpLimit} replies. 
                Thread will no longer bump after ${board.bumpLimit} replies.
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    // Setup image expansion
    document.querySelectorAll('.post-image').forEach(img => {
        img.addEventListener('click', () => {
            img.classList.toggle('expanded');
        });
    });
    
    // Update reply form
    updateReplyForm(thread);
}

function renderPost(post, isOP, replyIndex) {
    const parsedText = chan.parseComment(post.comment);
    const postId = post.id;
    const sessionId = post.sessionId || chan.generateSessionId();
    const isSage = post.sage;
    
    return `
        <div class="post ${isOP ? 'op' : ''} ${isSage ? 'sage' : ''}" id="post-${postId}" data-post-id="${postId}">
            <div class="post-header">
                <div class="post-info">
                    <span class="post-name">${post.author}</span>
                    <span class="post-id">ID: ${sessionId.substring(0, 8)}</span>
                    <span class="post-date">${chan.formatTimestamp(post.timestamp)}</span>
                    <span class="post-number" onclick="quotePost(${postId})" title="Click to quote">No.${postId}</span>
                </div>
            </div>
            ${post.subject ? `<div class="post-subject">${chan.escapeHtml(post.subject)}</div>` : ''}
            <div class="post-body">
                ${post.image ? `
                    <div class="post-image-container">
                        <img src="${post.image}" class="post-image" alt="Post image" loading="lazy">
                    </div>
                ` : ''}
                <div class="post-text">${parsedText}</div>
            </div>
        </div>
    `;
}

function updateReplyForm(thread) {
    const board = chan.boards[chan.currentBoard];
    const atBumpLimit = thread.replies.length >= board.bumpLimit;
    
    const sageCheckbox = document.getElementById('sage-checkbox');
    if (sageCheckbox && atBumpLimit) {
        sageCheckbox.checked = true;
        sageCheckbox.disabled = true;
    }
}

// Thread Creation
function showNewThreadForm() {
    document.getElementById('new-thread-modal').classList.remove('hidden');
}

function closeNewThreadModal() {
    document.getElementById('new-thread-modal').classList.add('hidden');
    document.getElementById('thread-subject').value = '';
    document.getElementById('thread-comment').value = '';
    document.getElementById('thread-image').value = '';
    document.getElementById('thread-image-preview').innerHTML = '';
}

async function createThread() {
    const subject = document.getElementById('thread-subject').value.trim();
    const comment = document.getElementById('thread-comment').value.trim();
    const imageFile = document.getElementById('thread-image').files[0];
    
    if (!comment) {
        alert('Comment is required to create a thread');
        return;
    }
    
    if (!chan.currentBoard) {
        alert('No board selected');
        return;
    }
    
    // SECURITY: Check DDoS protection
    if (window.SecurityManager) {
        const ddosCheck = window.SecurityManager.checkDDoSProtection();
        if (!ddosCheck.allowed) {
            alert(ddosCheck.message);
            return;
        }
        
        // Check for suspicious input
        if (window.SecurityManager.isSuspiciousInput(subject) || 
            window.SecurityManager.isSuspiciousInput(comment)) {
            alert('Post contains suspicious content and was blocked');
            window.SecurityManager.logSecurityEvent('suspicious_thread_content', { 
                board: chan.currentBoard 
            });
            return;
        }
    }
    
    // Rate limit check
    const rateCheck = chan.canPost(chan.currentBoard);
    if (!rateCheck.canPost) {
        alert(`Please wait ${rateCheck.wait} seconds before posting again`);
        return;
    }
    
    // Validate image if provided
    if (imageFile) {
        const validation = await chan.validateImage(imageFile);
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            createThreadWithData(subject, comment, e.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        createThreadWithData(subject, comment, null);
    }
}

function createThreadWithData(subject, comment, image) {
    const threadId = chan.postCounter++;
    const timestamp = Date.now();
    
    const thread = {
        id: threadId,
        board: chan.currentBoard,
        subject: subject,
        comment: comment,
        image: image,
        author: chan.username || 'Anonymous',
        sessionId: chan.sessionId,
        timestamp: timestamp,
        lastBump: timestamp,
        replies: [],
        sticky: false,
        locked: false
    };
    
    if (!chan.threads[chan.currentBoard]) {
        chan.threads[chan.currentBoard] = [];
    }
    
    // Add to front (newest first)
    chan.threads[chan.currentBoard].unshift(thread);
    
    // Prune if over thread limit
    const board = chan.boards[chan.currentBoard];
    if (chan.threads[chan.currentBoard].length > board.threadLimit) {
        chan.threads[chan.currentBoard] = chan.threads[chan.currentBoard].slice(0, board.threadLimit);
    }
    
    chan.saveThreads();
    chan.savePostCounter();
    chan.recordPost(chan.currentBoard);
    
    closeNewThreadModal();
    renderCatalog(chan.currentBoard);
    
    // Flash success
    showNotification(`Thread No.${threadId} created successfully!`);
}

// Reply Functions
async function submitReply() {
    const replyText = document.getElementById('reply-text').value.trim();
    const imageFile = document.getElementById('reply-image').files[0];
    const sage = document.getElementById('sage-checkbox')?.checked || false;
    
    if (!replyText) {
        alert('Comment is required');
        return;
    }
    
    if (!chan.currentThread) {
        alert('No thread selected');
        return;
    }
    
    // SECURITY: Check DDoS protection
    if (window.SecurityManager) {
        const ddosCheck = window.SecurityManager.checkDDoSProtection();
        if (!ddosCheck.allowed) {
            alert(ddosCheck.message);
            return;
        }
        
        // Check for suspicious input
        if (window.SecurityManager.isSuspiciousInput(replyText)) {
            alert('Reply contains suspicious content and was blocked');
            window.SecurityManager.logSecurityEvent('suspicious_reply_content', {
                threadId: chan.currentThread.id
            });
            return;
        }
    }
    
    // Rate limit check
    const rateCheck = chan.canPost(chan.currentBoard);
    if (!rateCheck.canPost) {
        alert(`Please wait ${rateCheck.wait} seconds before posting again`);
        return;
    }
    
    // Validate image if provided
    if (imageFile) {
        const validation = await chan.validateImage(imageFile);
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            addReplyWithData(replyText, e.target.result, sage);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addReplyWithData(replyText, null, sage);
    }
}

function addReplyWithData(comment, image, sage) {
    const replyId = chan.postCounter++;
    const timestamp = Date.now();
    
    const reply = {
        id: replyId,
        comment: comment,
        image: image,
        author: chan.username || 'Anonymous',
        sessionId: chan.sessionId,
        timestamp: timestamp,
        sage: sage
    };
    
    chan.currentThread.replies.push(reply);
    
    // Bump thread if not sage
    if (!sage) {
        chan.bumpThread(chan.currentBoard, chan.currentThread.id);
    }
    
    chan.saveThreads();
    chan.savePostCounter();
    chan.recordPost(chan.currentBoard);
    
    // Clear form
    document.getElementById('reply-text').value = '';
    document.getElementById('reply-image').value = '';
    document.getElementById('image-preview-name').textContent = '';
    if (document.getElementById('sage-checkbox')) {
        document.getElementById('sage-checkbox').checked = false;
    }
    
    // Re-render thread
    renderThread(chan.currentThread);
    
    // Scroll to new reply with highlight
    setTimeout(() => {
        const newPost = document.getElementById(`post-${replyId}`);
        if (newPost) {
            newPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newPost.classList.add('highlight-new');
            setTimeout(() => {
                newPost.classList.remove('highlight-new');
            }, 2000);
        }
    }, 100);
    
    showNotification(`Reply No.${replyId} posted successfully!`);
}

// Quote post (insert >>123 into reply box)
function quotePost(postId) {
    const replyTextarea = document.getElementById('reply-text');
    if (replyTextarea) {
        const currentText = replyTextarea.value;
        const quote = `>>${postId}\n`;
        replyTextarea.value = currentText + quote;
        replyTextarea.focus();
        
        // Scroll textarea to bottom
        replyTextarea.scrollTop = replyTextarea.scrollHeight;
    }
}

// Highlight quoted post when clicking >>123
function highlightPost(postId) {
    const post = document.getElementById(`post-${postId}`);
    if (post) {
        // Remove existing highlights
        document.querySelectorAll('.post').forEach(p => p.classList.remove('highlight-quote'));
        
        // Scroll and highlight
        post.scrollIntoView({ behavior: 'smooth', block: 'center' });
        post.classList.add('highlight-quote');
        
        setTimeout(() => {
            post.classList.remove('highlight-quote');
        }, 2000);
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Image Preview Handlers
document.addEventListener('DOMContentLoaded', () => {
    const replyImageInput = document.getElementById('reply-image');
    const threadImageInput = document.getElementById('thread-image');
    const imagePreviewName = document.getElementById('image-preview-name');
    const threadImagePreview = document.getElementById('thread-image-preview');
    
    if (replyImageInput && imagePreviewName) {
        replyImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                imagePreviewName.textContent = `📎 ${file.name} (${sizeMB}MB)`;
                
                if (file.size > 5 * 1024 * 1024) {
                    imagePreviewName.textContent += ' - TOO LARGE!';
                    imagePreviewName.style.color = '#ff0000';
                } else {
                    imagePreviewName.style.color = '#00FF88';
                }
            } else {
                imagePreviewName.textContent = '';
            }
        });
    }
    
    if (threadImageInput && threadImagePreview) {
        threadImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image too large! Max size is 5MB');
                    threadImageInput.value = '';
                    threadImagePreview.innerHTML = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    threadImagePreview.innerHTML = `<img src="${event.target.result}" class="preview-img" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                threadImagePreview.innerHTML = '';
            }
        });
    }
});
