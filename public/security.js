// The Basement - Security Module
// Comprehensive XSS, DDoS, and abuse prevention

class SecurityManager {
    constructor() {
        this.rateLimit = {
            chat: { limit: 5000, // 5 seconds between messages
                   attempts: new Map() },
            forum: { limit: 30000, // 30 seconds between posts
                    attempts: new Map() },
            wallet: { limit: 10000, // 10 seconds between wallet operations
                     attempts: new Map() },
            general: { limit: 1000, // 1 second general actions
                      attempts: new Map() }
        };
        
        this.sessionId = this.getSessionId();
        this.requestCount = 0;
        this.requestWindow = 60000; // 1 minute window
        this.maxRequestsPerWindow = 100; // Max 100 requests per minute
        this.blockedIPs = new Set();
        
        this.init();
    }

    init() {
        // Add CSP meta tag if not present
        this.addCSP();
        
        // Monitor for suspicious activity
        this.monitorActivity();
        
        // Setup global error handler
        this.setupErrorHandler();
        
        // Clear old rate limit data every 5 minutes
        setInterval(() => this.cleanupRateLimits(), 300000);
    }

    getSessionId() {
        let id = sessionStorage.getItem('security_session_id');
        if (!id) {
            id = this.generateSecureId();
            sessionStorage.setItem('security_session_id', id);
        }
        return id;
    }

    generateSecureId() {
        // Generate cryptographically secure random ID
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Content Security Policy
    addCSP() {
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!existingCSP) {
            const csp = document.createElement('meta');
            csp.httpEquiv = 'Content-Security-Policy';
            csp.content = `
                default-src 'self';
                script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                font-src 'self' https://fonts.gstatic.com;
                img-src 'self' data: blob: https:;
                connect-src 'self' https://*.base.org https://basescan.org;
                frame-src 'none';
                object-src 'none';
                base-uri 'self';
                form-action 'self';
            `.replace(/\s+/g, ' ').trim();
            document.head.appendChild(csp);
        }
    }

    // XSS Protection - Sanitize HTML
    sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        let sanitized = div.innerHTML;
        
        // Additional XSS pattern blocking
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // onclick, onerror, etc.
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
            /<link[^>]*>/gi,
            /<meta[^>]*>/gi,
            /vbscript:/gi,
            /data:text\/html/gi
        ];
        
        xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized;
    }

    // Sanitize with allowed HTML (for forum greentext, links, etc.)
    sanitizeWithMarkup(input) {
        if (typeof input !== 'string') return '';
        
        let sanitized = this.sanitizeHTML(input);
        
        // Only allow specific safe markup that we control
        // Greentext: >text
        sanitized = sanitized.replace(/^&gt;(.+)$/gm, '<span class="greentext">&gt;$1</span>');
        
        // Quote links: >>123 (only digits after >>)
        sanitized = sanitized.replace(/&gt;&gt;(\d+)/g, '<a href="#post-$1" class="quote-link" data-post-id="$1">&gt;&gt;$1</a>');
        
        // Line breaks
        sanitized = sanitized.replace(/\n/g, '<br>');
        
        return sanitized;
    }

    // URL Validation
    isValidURL(url) {
        try {
            const parsed = new URL(url);
            // Only allow https and http
            return ['https:', 'http:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }

    // Image Validation
    async validateImage(file) {
        const errors = [];
        
        // Size check: 5MB max
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push(`Image too large. Max size: ${(maxSize/1024/1024).toFixed(1)}MB`);
        }
        
        // Type check
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            errors.push('Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
        }
        
        // File extension check (double-check)
        const ext = file.name.split('.').pop().toLowerCase();
        const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!allowedExts.includes(ext)) {
            errors.push('Invalid file extension');
        }
        
        // Dimension check (optional: prevent massive images)
        if (file.size > 0) {
            const dimensions = await this.getImageDimensions(file);
            if (dimensions.width > 10000 || dimensions.height > 10000) {
                errors.push('Image dimensions too large (max 10000x10000)');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ width: 0, height: 0 });
            };
            
            img.src = url;
        });
    }

    // Rate Limiting
    checkRateLimit(category = 'general') {
        const config = this.rateLimit[category];
        if (!config) return { allowed: true };
        
        const key = this.sessionId;
        const now = Date.now();
        const lastAttempt = config.attempts.get(key) || 0;
        
        if (now - lastAttempt < config.limit) {
            const waitTime = Math.ceil((config.limit - (now - lastAttempt)) / 1000);
            return {
                allowed: false,
                waitTime: waitTime,
                message: `Rate limit exceeded. Please wait ${waitTime} seconds.`
            };
        }
        
        config.attempts.set(key, now);
        return { allowed: true };
    }

    // DDoS Protection - Request throttling
    checkDDoSProtection() {
        const now = Date.now();
        
        // Reset counter every minute
        if (!this.lastWindowReset || now - this.lastWindowReset > this.requestWindow) {
            this.requestCount = 0;
            this.lastWindowReset = now;
        }
        
        this.requestCount++;
        
        if (this.requestCount > this.maxRequestsPerWindow) {
            this.blockSession();
            return {
                allowed: false,
                message: 'Too many requests. You have been temporarily blocked.'
            };
        }
        
        return { allowed: true };
    }

    blockSession() {
        this.blockedIPs.add(this.sessionId);
        
        // Auto-unblock after 10 minutes
        setTimeout(() => {
            this.blockedIPs.delete(this.sessionId);
        }, 600000);
        
        console.warn('Session blocked for excessive requests');
    }

    isSessionBlocked() {
        return this.blockedIPs.has(this.sessionId);
    }

    // SQL Injection Prevention (for future backend)
    sanitizeSQL(input) {
        if (typeof input !== 'string') return '';
        
        // Escape single quotes and other SQL special chars
        return input
            .replace(/'/g, "''")
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\0/g, '\\0');
    }

    // Input Validation
    validateInput(input, type, options = {}) {
        const { minLength = 0, maxLength = 10000, required = false } = options;
        
        if (required && (!input || input.trim().length === 0)) {
            return { valid: false, error: 'This field is required' };
        }
        
        if (input && input.length < minLength) {
            return { valid: false, error: `Minimum length: ${minLength} characters` };
        }
        
        if (input && input.length > maxLength) {
            return { valid: false, error: `Maximum length: ${maxLength} characters` };
        }
        
        switch (type) {
            case 'username':
                // Alphanumeric, underscore, dash only
                if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
                    return { valid: false, error: 'Username can only contain letters, numbers, _ and -' };
                }
                break;
                
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
                    return { valid: false, error: 'Invalid email format' };
                }
                break;
                
            case 'walletAddress':
                if (!/^0x[a-fA-F0-9]{40}$/.test(input)) {
                    return { valid: false, error: 'Invalid Ethereum address' };
                }
                break;
                
            case 'text':
                // General text - already sanitized, just check length
                break;
        }
        
        return { valid: true };
    }

    // Monitor for suspicious activity
    monitorActivity() {
        // Detect rapid form submissions
        let formSubmitCount = 0;
        let lastReset = Date.now();
        
        document.addEventListener('submit', (e) => {
            const now = Date.now();
            
            if (now - lastReset > 60000) {
                formSubmitCount = 0;
                lastReset = now;
            }
            
            formSubmitCount++;
            
            if (formSubmitCount > 20) {
                e.preventDefault();
                alert('Too many form submissions. Please slow down.');
                this.blockSession();
            }
        });
        
        // Detect rapid clicks (bot detection)
        let clickCount = 0;
        let clickReset = Date.now();
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            
            if (now - clickReset > 10000) {
                clickCount = 0;
                clickReset = now;
            }
            
            clickCount++;
            
            if (clickCount > 50) {
                console.warn('Suspicious rapid clicking detected');
            }
        });
    }

    // Setup global error handler
    setupErrorHandler() {
        window.addEventListener('error', (e) => {
            console.error('Global error caught:', e.message);
            // Don't expose internal errors to user
            return true;
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    // Clean up old rate limit data
    cleanupRateLimits() {
        const now = Date.now();
        
        Object.values(this.rateLimit).forEach(config => {
            config.attempts.forEach((timestamp, key) => {
                if (now - timestamp > config.limit * 2) {
                    config.attempts.delete(key);
                }
            });
        });
    }

    // LocalStorage safety
    safeLocalStorageSet(key, value) {
        try {
            // Check available space
            const testKey = '_storage_test_';
            const testValue = new Array(1024 * 1024).join('a'); // 1MB test
            
            try {
                localStorage.setItem(testKey, testValue);
                localStorage.removeItem(testKey);
            } catch {
                // Storage is full, clean up old data
                console.warn('LocalStorage full, cleaning up...');
                this.cleanupOldData();
            }
            
            localStorage.setItem(key, value);
            return { success: true };
        } catch (e) {
            console.error('LocalStorage error:', e);
            return { success: false, error: 'Storage quota exceeded' };
        }
    }

    cleanupOldData() {
        // Remove old chat messages
        const chatKeys = Object.keys(localStorage).filter(k => k.startsWith('chat_'));
        chatKeys.slice(0, Math.floor(chatKeys.length / 2)).forEach(k => {
            localStorage.removeItem(k);
        });
        
        // Remove old demo games
        localStorage.removeItem('basement_demo_games');
    }

    // Prevent clickjacking
    preventClickjacking() {
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
    }

    // Safe DOM element creation
    createSafeElement(tag, content, attributes = {}) {
        const element = document.createElement(tag);
        
        // Set text content safely (auto-escapes)
        if (content) {
            element.textContent = content;
        }
        
        // Set attributes safely
        Object.entries(attributes).forEach(([key, value]) => {
            // Block dangerous attributes
            const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover'];
            if (!dangerousAttrs.includes(key.toLowerCase())) {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }

    // Safe HTML rendering
    renderSafeHTML(container, html) {
        // Create temporary container
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove all script tags
        temp.querySelectorAll('script').forEach(el => el.remove());
        
        // Remove dangerous attributes
        temp.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        container.innerHTML = temp.innerHTML;
    }

    // Validate wallet address
    isValidWalletAddress(address) {
        if (!address || typeof address !== 'string') return false;
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // Validate transaction hash
    isValidTxHash(hash) {
        if (!hash || typeof hash !== 'string') return false;
        return /^0x[a-fA-F0-9]{64}$/.test(hash);
    }

    // Safe number parsing
    safeParseFloat(input, defaultValue = 0) {
        const parsed = parseFloat(input);
        if (isNaN(parsed) || !isFinite(parsed)) {
            return defaultValue;
        }
        return parsed;
    }

    safeParseInt(input, defaultValue = 0) {
        const parsed = parseInt(input, 10);
        if (isNaN(parsed) || !isFinite(parsed)) {
            return defaultValue;
        }
        return parsed;
    }

    // Detect suspicious patterns
    isSuspiciousInput(input) {
        if (!input || typeof input !== 'string') return false;
        
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i,
            /eval\(/i,
            /expression\(/i,
            /<iframe/i,
            /document\.cookie/i,
            /window\.location/i,
            /<object/i,
            /<embed/i,
            /vbscript:/i,
            /data:text\/html/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(input));
    }

    // Log security event
    logSecurityEvent(type, details) {
        const event = {
            type: type,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            details: details
        };
        
        console.warn('Security Event:', event);
        
        // Store in session for analysis
        const events = JSON.parse(sessionStorage.getItem('security_events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        sessionStorage.setItem('security_events', JSON.stringify(events));
    }

    // Hash data (for comparing without storing plaintext)
    async hashData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Prevent timing attacks (constant-time comparison)
    constantTimeCompare(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string') return false;
        if (a.length !== b.length) return false;
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }
}

// Initialize global security manager
let securityManager;
if (typeof window !== 'undefined') {
    securityManager = new SecurityManager();
    
    // Prevent clickjacking
    securityManager.preventClickjacking();
    
    // Make available globally
    window.SecurityManager = securityManager;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}

