/**
 * Token Gating Utilities
 * Verify token holdings before allowing actions
 */

import { TOKEN_CONFIG, meetsMinimumRequirement } from './token-config';

export interface TokenGateResult {
  allowed: boolean;
  balance?: string;
  reason?: string;
  balanceFormatted?: string;
}

/**
 * Check if an address has sufficient tokens for an action
 */
export async function checkTokenGate(
  address: string,
  action: 'createChannel' | 'createThread' | 'postMessage' | 'createPost'
): Promise<TokenGateResult> {
  try {
    // Validate address
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return {
        allowed: false,
        reason: 'Invalid wallet address',
      };
    }

    // Fetch balance from API
    const response = await fetch(
      `/api/token/balance?address=${address}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch token balance');
    }

    const data = await response.json();

    // Check if user meets the requirement for the specific action
    const hasPermission = data.permissions[`can${action.charAt(0).toUpperCase() + action.slice(1)}`];

    if (!hasPermission) {
      const requirement = TOKEN_CONFIG.requirements[action];
      const requiredFormatted = (Number(requirement) / 1e18).toFixed(6);
      
      return {
        allowed: false,
        balance: data.balance,
        balanceFormatted: data.balanceFormatted,
        reason: `You need at least ${requiredFormatted} $BASEMENT tokens to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}. Current balance: ${data.balanceFormatted}`,
      };
    }

    return {
      allowed: true,
      balance: data.balance,
      balanceFormatted: data.balanceFormatted,
    };
  } catch (error) {
    console.error('Token gate check error:', error);
    return {
      allowed: false,
      reason: 'Failed to verify token holdings. Please try again.',
    };
  }
}

/**
 * Client-side token gate check
 */
export function showTokenGateError(reason: string) {
  // Create a styled error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'token-gate-error';
  errorDiv.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 0, 0, 0.95);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    border: 2px solid #ff0000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    z-index: 10000;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.7rem;
    text-align: center;
    max-width: 90%;
    animation: slideInDown 0.3s ease-out;
  `;
  errorDiv.textContent = reason;

  document.body.appendChild(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'slideOutUp 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

/**
 * Get token purchase links
 */
export function getTokenPurchaseLinks() {
  return {
    dexScreener: TOKEN_CONFIG.links.dexScreener,
    geckoterminal: TOKEN_CONFIG.links.geckoterminal,
    baseScan: TOKEN_CONFIG.links.baseScan,
  };
}

/**
 * Format token gate error message with purchase links
 */
export function formatTokenGateMessage(reason: string): string {
  const links = getTokenPurchaseLinks();
  return `
    ${reason}
    
    Get $BASEMENT tokens:
    • DEX Screener: ${links.dexScreener}
    • GeckoTerminal: ${links.geckoterminal}
    • BaseScan: ${links.baseScan}
  `;
}

