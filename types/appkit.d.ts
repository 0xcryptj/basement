/**
 * TypeScript declarations for Reown AppKit web components
 * 
 * AppKit provides global HTML elements that don't require importing.
 * These declarations prevent TypeScript errors when using them.
 */

declare namespace JSX {
  interface IntrinsicElements {
    'appkit-button': {
      label?: string;
      balance?: 'show' | 'hide';
      size?: 'sm' | 'md' | 'lg';
      disabled?: boolean;
      className?: string;
    };
    
    'appkit-account-button': {
      disabled?: boolean;
      className?: string;
    };
    
    'appkit-network-button': {
      disabled?: boolean;
      className?: string;
    };
    
    'appkit-connect-button': {
      label?: string;
      loadingLabel?: string;
      size?: 'sm' | 'md' | 'lg';
      className?: string;
    };
  }
}

export {};

