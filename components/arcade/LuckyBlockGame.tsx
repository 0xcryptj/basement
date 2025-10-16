'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther, Address } from 'viem';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { 
  Avatar,
  Name,
  Identity,
  Address as OnchainAddress,
} from '@coinbase/onchainkit/identity';

// LuckyBlock Contract on Base Mainnet
const LUCKYBLOCK_ADDRESS = '0xf7Cd6fcc391ad2c771c84159E60BDAEeE9BA821e' as Address;

const LUCKYBLOCK_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "referrer", "type": "address" }],
    "name": "enterRound",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRound",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "playerCount", "type": "uint256" },
      { "internalType": "uint256", "name": "pot", "type": "uint256" },
      { "internalType": "uint256", "name": "timeLeft", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint8", "name": "state", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      { "internalType": "uint256", "name": "totalWagered", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPayouts", "type": "uint256" },
      { "internalType": "uint256", "name": "rounds", "type": "uint256" },
      { "internalType": "uint256", "name": "activePlayers", "type": "uint256" },
      { "internalType": "uint256", "name": "houseBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "wagerCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "PlayerEntered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "roundId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "randomSeed", "type": "uint256" }
    ],
    "name": "WinnerDrawn",
    "type": "event"
  }
] as const;

export function LuckyBlockGame() {
  const { address, isConnected } = useAccount();
  const [betAmount, setBetAmount] = useState('0.001');
  
  // Read current round data using wagmi
  const { data: roundData, refetch: refetchRound } = useReadContract({
    address: LUCKYBLOCK_ADDRESS,
    abi: LUCKYBLOCK_ABI,
    functionName: 'getCurrentRound',
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  });

  // Read global stats
  const { data: globalStats, refetch: refetchStats } = useReadContract({
    address: LUCKYBLOCK_ADDRESS,
    abi: LUCKYBLOCK_ABI,
    functionName: 'getGlobalStats',
    query: {
      refetchInterval: 10000,
    }
  });

  // Write contract - Enter round
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // Watch for WinnerDrawn events
  useWatchContractEvent({
    address: LUCKYBLOCK_ADDRESS,
    abi: LUCKYBLOCK_ABI,
    eventName: 'WinnerDrawn',
    onLogs(logs) {
      console.log('🎉 Winner drawn!', logs);
      refetchRound();
      refetchStats();
    },
  });

  // Watch for PlayerEntered events
  useWatchContractEvent({
    address: LUCKYBLOCK_ADDRESS,
    abi: LUCKYBLOCK_ABI,
    eventName: 'PlayerEntered',
    onLogs(logs) {
      console.log('✅ Player entered!', logs);
      refetchRound();
    },
  });

  const enterRound = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const amount = parseEther(betAmount);
      const referrer = '0x0000000000000000000000000000000000000000'; // Zero address for no referrer
      
      writeContract({
        address: LUCKYBLOCK_ADDRESS,
        abi: LUCKYBLOCK_ABI,
        functionName: 'enterRound',
        args: [referrer as Address],
        value: amount,
      });
    } catch (err) {
      console.error('Transaction error:', err);
      alert('Transaction failed: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      alert('✅ Successfully entered the round!');
      refetchRound();
      refetchStats();
    }
  }, [isSuccess, refetchRound, refetchStats]);

  useEffect(() => {
    if (error) {
      alert('❌ Transaction failed: ' + error.message);
    }
  }, [error]);

  return (
    <div className="lucky-block-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="header" style={{ 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '2px solid #0052ff'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#0052ff' }}>
          🎰 LUCKY BLOCK JACKPOT
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
          Multi-player jackpot on Base Network
        </p>
        
        {/* OnchainKit Wallet Component */}
        <div style={{ marginTop: '20px' }}>
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <OnchainAddress />
              </Identity>
              <WalletDropdownLink
                icon="wallet"
                href="https://keys.coinbase.com"
              >
                Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>

      {/* Round Info */}
      {roundData && (
        <div className="round-info" style={{
          background: 'rgba(0, 82, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid rgba(0, 82, 255, 0.3)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
            Round #{roundData[0].toString()}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>Players</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {roundData[1].toString()} / 20
              </p>
            </div>
            <div>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>Pot</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0052ff' }}>
                {formatEther(roundData[2])} ETH
              </p>
            </div>
            <div>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>Time Left</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {roundData[3].toString()}s
              </p>
            </div>
            <div>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>Status</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: roundData[4] ? '#00ff00' : '#ff0000' }}>
                {roundData[4] ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Stats */}
      {globalStats && (
        <div className="global-stats" style={{
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>📊 Global Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
            <div>
              <p style={{ color: '#888' }}>Total Wagered</p>
              <p style={{ fontWeight: 'bold' }}>{formatEther(globalStats[0])} ETH</p>
            </div>
            <div>
              <p style={{ color: '#888' }}>Total Payouts</p>
              <p style={{ fontWeight: 'bold' }}>{formatEther(globalStats[1])} ETH</p>
            </div>
            <div>
              <p style={{ color: '#888' }}>Total Rounds</p>
              <p style={{ fontWeight: 'bold' }}>{globalStats[2].toString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bet Controls */}
      <div className="bet-controls" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #0052ff'
      }}>
        <h3 style={{ marginBottom: '15px' }}>💰 Place Your Bet</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
            Bet Amount (ETH)
          </label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            step="0.001"
            min="0.001"
            max="1"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '1rem',
              borderRadius: '5px',
              border: '1px solid #0052ff',
              background: 'rgba(0, 0, 0, 0.5)',
              color: '#fff'
            }}
          />
          <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '5px' }}>
            Min: 0.001 ETH • Max: 1 ETH
          </p>
        </div>
        
        <button
          onClick={enterRound}
          disabled={!isConnected || isPending}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: '5px',
            border: 'none',
            background: isConnected ? (isPending ? '#666' : '#0052ff') : '#333',
            color: '#fff',
            cursor: isConnected && !isPending ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            if (isConnected && !isPending) {
              e.currentTarget.style.background = '#0041cc';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (isConnected && !isPending) {
              e.currentTarget.style.background = '#0052ff';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {!isConnected ? '🔒 Connect Wallet' : isPending ? '⏳ Confirming...' : '🎲 ENTER ROUND'}
        </button>

        {isPending && (
          <p style={{ marginTop: '10px', textAlign: 'center', color: '#0052ff' }}>
            Please confirm the transaction in your wallet...
          </p>
        )}
      </div>

      {/* Contract Info */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.7rem', color: '#666' }}>
        <p>Contract: {LUCKYBLOCK_ADDRESS}</p>
        <p>Network: Base Mainnet (Chain ID: 8453)</p>
        <a 
          href={`https://basescan.org/address/${LUCKYBLOCK_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0052ff', textDecoration: 'underline' }}
        >
          View on BaseScan
        </a>
      </div>
    </div>
  );
}

