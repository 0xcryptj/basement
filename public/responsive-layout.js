/**
 * Responsive Layout Manager
 * Handles hamburger menu, collapsible panels, and dynamic scaling
 */

class ResponsiveLayoutManager {
    constructor() {
        this.chatCollapsed = false;
        this.isMobile = window.innerWidth < 768;
        this.unreadCount = 0;
        
        this.init();
    }

    init() {
        // Use existing hamburger menu from style.css
        const existingHamburger = document.getElementById('mobile-menu-toggle');
        if (existingHamburger) {
            existingHamburger.addEventListener('click', () => this.toggleMobileMenu());
            this.hamburgerMenu = existingHamburger;
        }

        // Add chat toggle functionality
        this.setupChatToggle();

        // Setup collapsible sections
        this.setupCollapsibleSections();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Initial layout adjustment
        this.adjustLayout();

        console.log('✅ Responsive layout initialized');
    }

    setupChatToggle() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'chat-toggle';
        toggle.textContent = this.chatCollapsed ? 'OPEN CHAT' : 'CLOSE CHAT';
        toggle.addEventListener('click', () => this.toggleChat());
        
        chatContainer.appendChild(toggle);
        this.chatToggle = toggle;

        // Create minimize button in header
        const chatHeader = chatContainer.querySelector('.chat-header');
        if (chatHeader) {
            const minimizeBtn = document.createElement('button');
            minimizeBtn.className = 'chat-minimize';
            minimizeBtn.innerHTML = '−';
            minimizeBtn.addEventListener('click', () => this.toggleChat());
            chatHeader.appendChild(minimizeBtn);
        }
    }

    setupCollapsibleSections() {
        const sections = document.querySelectorAll('.collapsible-section');
        
        sections.forEach(section => {
            const header = section.querySelector('.collapsible-header');
            if (!header) return;

            header.addEventListener('click', () => {
                section.classList.toggle('expanded');
                
                // Store state in localStorage
                const sectionId = section.id;
                if (sectionId) {
                    localStorage.setItem(
                        `section_${sectionId}`,
                        section.classList.contains('expanded') ? 'true' : 'false'
                    );
                }
            });

            // Restore state from localStorage
            const sectionId = section.id;
            if (sectionId) {
                const isExpanded = localStorage.getItem(`section_${sectionId}`) === 'true';
                if (isExpanded) {
                    section.classList.add('expanded');
                }
            }
        });
    }

    toggleChat() {
        const chatContainer = document.querySelector('.chat-container');
        const mainContent = document.querySelector('.main-content');
        
        if (!chatContainer) return;

        this.chatCollapsed = !this.chatCollapsed;

        if (this.chatCollapsed) {
            chatContainer.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('chat-collapsed');
            if (this.chatToggle) this.chatToggle.textContent = 'OPEN CHAT';
        } else {
            chatContainer.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('chat-collapsed');
            if (this.chatToggle) this.chatToggle.textContent = 'CLOSE CHAT';
            this.unreadCount = 0;
            this.updateNotificationBadge();
        }

        // Trigger resize event for other components
        window.dispatchEvent(new Event('resize'));
    }

    toggleMobileMenu() {
        if (!this.hamburgerMenu) return;

        const isActive = this.hamburgerMenu.classList.toggle('active');
        const chatContainer = document.querySelector('.chat-container');

        if (isActive) {
            // Show chat on mobile
            if (chatContainer) {
                chatContainer.classList.remove('mobile-hidden');
                chatContainer.classList.remove('collapsed');
            }
        } else {
            // Hide chat on mobile
            if (chatContainer) {
                chatContainer.classList.add('mobile-hidden');
            }
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;

        // Mobile <-> Desktop transition
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                // Switched to mobile
                if (!this.hamburgerMenu) {
                    this.createHamburgerMenu();
                }
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    chatContainer.classList.add('mobile-hidden');
                }
            } else {
                // Switched to desktop
                if (this.hamburgerMenu) {
                    this.hamburgerMenu.remove();
                    this.hamburgerMenu = null;
                }
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    chatContainer.classList.remove('mobile-hidden');
                }
            }
        }

        this.adjustLayout();
    }

    adjustLayout() {
        // Adjust content width based on chat state
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        if (this.isMobile) {
            mainContent.style.marginRight = '0';
        } else {
            mainContent.style.marginRight = this.chatCollapsed ? '0' : '350px';
        }
    }

    addUnreadMessage() {
        if (this.chatCollapsed) {
            this.unreadCount++;
            this.updateNotificationBadge();
        }
    }

    updateNotificationBadge() {
        let badge = document.querySelector('.notification-badge');
        
        if (this.unreadCount > 0 && this.chatCollapsed) {
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'notification-badge';
                const toggle = document.querySelector('.chat-toggle');
                if (toggle) {
                    toggle.style.position = 'relative';
                    toggle.appendChild(badge);
                }
            }
            if (badge) {
                badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount.toString();
            }
        } else {
            if (badge) badge.remove();
        }
    }

    // Dynamic element centering
    centerElement(element) {
        if (!element) return;

        const container = element.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const elementWidth = element.clientWidth;
        const elementHeight = element.clientHeight;

        element.style.left = `${(containerWidth - elementWidth) / 2}px`;
        element.style.top = `${(containerHeight - elementHeight) / 2}px`;
    }

    // Dynamic scaling for game boards
    scaleGameBoard(board, maxWidth = 600, maxHeight = 600) {
        if (!board) return;

        const container = board.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth - 40; // padding
        const containerHeight = container.clientHeight - 40;

        const scaleX = containerWidth / maxWidth;
        const scaleY = containerHeight / maxHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

        board.style.transform = `scale(${scale})`;
        board.style.transformOrigin = 'center center';
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.layoutManager = new ResponsiveLayoutManager();
    });
} else {
    window.layoutManager = new ResponsiveLayoutManager();
}

// Export for use in other scripts
window.ResponsiveLayoutManager = ResponsiveLayoutManager;

