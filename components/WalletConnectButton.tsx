'use client';

/**
 * Wallet Connect Button using Reown AppKit
 * 
 * This component uses the native AppKit web component for wallet connections.
 * The <appkit-button> and <appkit-account-button> are global HTML elements
 * provided by Reown AppKit - no imports needed!
 * 
 * Features:
 * - Multi-wallet support (MetaMask, Coinbase, WalletConnect, etc.)
 * - Network switching
 * - Account management
 * - Balance display
 */

interface WalletConnectButtonProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Optional label for the connect button
   */
  label?: string;
  
  /**
   * Show balance when connected
   */
  balance?: 'show' | 'hide';
}

export function WalletConnectButton({ 
  className = '', 
  label,
  balance = 'show'
}: WalletConnectButtonProps) {
  return (
    <div className={className}>
      {/* AppKit provides these web components globally */}
      <appkit-button 
        label={label}
        balance={balance}
      />
    </div>
  );
}

/**
 * Account button for when user is already connected
 * Shows address, balance, and allows network switching
 */
export function WalletAccountButton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <appkit-account-button />
    </div>
  );
}

/**
 * Network switch button
 * Allows users to switch between configured networks
 */
export function WalletNetworkButton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <appkit-network-button />
    </div>
  );
}

