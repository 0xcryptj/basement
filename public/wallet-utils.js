/**
 * Wallet Connection and Token Burn Utilities
 * Handles wallet connection, Base network switching, and token burns
 */

// Base Network Configuration
const BASE_NETWORK = {
    chainId: '0x2105', // 8453 in hex
    chainName: 'Base',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
};

// Token Configuration
const BASEMENT_TOKEN = {
    address: '0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23',
    decimals: 18,
    symbol: 'BASEMENT',
    burnAddress: '0x000000000000000000000000000000000000dEaD',
    burnPerChannel: '5000000000000000000' // 5 tokens in wei
};

/**
 * Switch to Base Network
 */
async function switchToBaseNetwork() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
    }

    try {
        // Try to switch to Base
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_NETWORK.chainId }],
        });
        console.log('✅ Switched to Base network');
        return true;
    } catch (switchError) {
        // If Base isn't added, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [BASE_NETWORK],
                });
                console.log('✅ Added and switched to Base network');
                return true;
            } catch (addError) {
                console.error('Failed to add Base network:', addError);
                throw new Error('Failed to add Base network. Please add it manually.');
            }
        } else {
            console.error('Failed to switch network:', switchError);
            throw new Error('Please switch to Base network in your wallet.');
        }
    }
}

/**
 * Connect Wallet
 */
async function connectWallet() {
    try {
        // Check for ethereum provider
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Please install MetaMask or another Web3 wallet to connect.');
        }

        // Switch to Base network
        await switchToBaseNetwork();

        // Request accounts
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please unlock your wallet.');
        }

        const address = accounts[0];
        console.log('✅ Wallet connected:', address);

        // Save to localStorage
        localStorage.setItem('basement_walletAddress', address);
        localStorage.setItem('basement_isConnected', 'true');

        // Check token balance
        const balance = await getTokenBalance(address);
        console.log('💰 Token balance:', balance, '$BASEMENT');

        return {
            address,
            balance,
            isConnected: true
        };

    } catch (error) {
        console.error('❌ Wallet connection failed:', error);
        throw error;
    }
}

/**
 * Get Token Balance
 */
async function getTokenBalance(address) {
    try {
        const data = await window.ethereum.request({
            method: 'eth_call',
            params: [{
                to: BASEMENT_TOKEN.address,
                data: '0x70a08231' + address.slice(2).padStart(64, '0') // balanceOf(address)
            }, 'latest']
        });

        const balance = BigInt(data);
        return Number(balance) / 1e18; // Convert from wei
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return 0;
    }
}

/**
 * Burn Tokens (Transfer to dead address)
 */
async function burnTokens(amount) {
    try {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts'
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No wallet connected');
        }

        const from = accounts[0];
        
        // ERC-20 transfer(address to, uint256 amount)
        // Function signature: 0xa9059cbb
        const toAddress = BASEMENT_TOKEN.burnAddress.slice(2).padStart(64, '0');
        const amountHex = BigInt(amount).toString(16).padStart(64, '0');
        const data = '0xa9059cbb' + toAddress + amountHex;

        // Send transaction
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: from,
                to: BASEMENT_TOKEN.address,
                data: data,
                value: '0x0'
            }]
        });

        console.log('🔥 Burn transaction sent:', txHash);
        
        // Wait for confirmation
        await waitForTransaction(txHash);
        
        console.log('✅ Tokens burned successfully!');
        return txHash;

    } catch (error) {
        console.error('❌ Burn transaction failed:', error);
        throw error;
    }
}

/**
 * Wait for transaction confirmation
 */
async function waitForTransaction(txHash, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
            });

            if (receipt && receipt.status) {
                return receipt;
            }
        } catch (error) {
            console.log('Waiting for confirmation...');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
    
    throw new Error('Transaction confirmation timeout');
}

/**
 * Create Channel with Token Burn
 */
async function createChannelWithBurn(channelName, channelDescription) {
    try {
        const address = localStorage.getItem('basement_walletAddress');
        
        if (!address) {
            throw new Error('Please connect your wallet first');
        }

        // 1. Check token balance
        const balance = await getTokenBalance(address);
        const burnAmount = 5; // 5 tokens

        if (balance < burnAmount) {
            throw new Error(`You need at least ${burnAmount} $BASEMENT tokens. Your balance: ${balance.toFixed(4)}`);
        }

        // 2. Execute burn transaction
        console.log(`🔥 Burning ${burnAmount} $BASEMENT tokens...`);
        const burnTxHash = await burnTokens(BASEMENT_TOKEN.burnPerChannel);
        console.log('✅ Burn complete:', burnTxHash);

        // 3. Create channel via API
        const response = await fetch('/api/chat/channels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: channelName,
                slug: channelName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                description: channelDescription,
                walletAddress: address,
                burnTxHash: burnTxHash
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to create channel');
        }

        console.log('✅ Channel created successfully!');
        return data.channel;

    } catch (error) {
        console.error('❌ Channel creation failed:', error);
        throw error;
    }
}

// Export functions
window.BasementWallet = {
    connect: connectWallet,
    switchToBase: switchToBaseNetwork,
    getBalance: getTokenBalance,
    burnTokens: burnTokens,
    createChannelWithBurn: createChannelWithBurn,
    BASEMENT_TOKEN: BASEMENT_TOKEN,
    BASE_NETWORK: BASE_NETWORK
};

console.log('✅ Wallet utilities loaded');

