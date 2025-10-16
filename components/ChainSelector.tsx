import { useState } from 'react';

export type Chain = 'base' | 'solana';

interface ChainSelectorProps {
  currentChain: Chain;
  onChainChange: (chain: Chain) => void;
}

export default function ChainSelector({ currentChain, onChainChange }: ChainSelectorProps) {
  return (
    <div className="chain-selector">
      <div className="chain-label">Network:</div>
      <div className="chain-buttons">
        <button
          className={`chain-btn ${currentChain === 'base' ? 'active' : ''}`}
          onClick={() => onChainChange('base')}
        >
          <span className="chain-icon">🔵</span>
          <span className="chain-name">Base</span>
          <span className="chain-tag">ETH</span>
        </button>
        <button
          className={`chain-btn ${currentChain === 'solana' ? 'active' : ''}`}
          onClick={() => onChainChange('solana')}
        >
          <span className="chain-icon">☀️</span>
          <span className="chain-name">Solana</span>
          <span className="chain-tag">SOL</span>
        </button>
      </div>

      <style jsx>{`
        .chain-selector {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px 15px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .chain-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 0.6rem;
          color: #888;
        }

        .chain-buttons {
          display: flex;
          gap: 8px;
        }

        .chain-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(0, 82, 255, 0.1);
          border: 1px solid rgba(0, 82, 255, 0.3);
          border-radius: 5px;
          color: #00BFFF;
          font-family: 'Courier Prime', monospace;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .chain-btn:hover {
          background: rgba(0, 82, 255, 0.2);
          transform: translateY(-1px);
        }

        .chain-btn.active {
          background: rgba(0, 82, 255, 0.3);
          border-color: #0052ff;
          box-shadow: 0 0 15px rgba(0, 82, 255, 0.5);
        }

        .chain-icon {
          font-size: 1rem;
        }

        .chain-name {
          font-weight: 600;
        }

        .chain-tag {
          font-size: 0.5rem;
          color: #888;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .chain-label {
            display: none;
          }

          .chain-name {
            display: none;
          }

          .chain-btn {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}

