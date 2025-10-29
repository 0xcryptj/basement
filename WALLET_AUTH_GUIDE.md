# Wallet Authentication Implementation Guide

## Overview
This document describes the wallet authentication system implemented for The Basement, using message signing as a form of authentication.

## Features Implemented

### 1. **Message Signing Authentication**
- Users must sign a cryptographic message to prove wallet ownership
- Message format follows a standard protocol with wallet address, origin, and timestamp
- Signatures are verified locally before storing

### 2. **Debugging & Logging**
- Comprehensive console logging throughout the connection process
- Visual indicators (🔌 🔗 🌐 📝 ✅ ❌) for different stages
- Clear error messages for troubleshooting

### 3. **Connection Flow**
1. **Wallet Detection**: Detects which wallet is available (MetaMask, Coinbase, Phantom)
2. **Account Request**: Requests access to user's wallet accounts
3. **Network Switch**: Automatically switches to Base network (Chain ID: 8453)
4. **Message Signing**: Prompts user to sign an authentication message
5. **Signature Verification**: Verifies the signature matches the wallet address
6. **Database Sync**: Ensures user exists in Supabase database
7. **State Update**: Updates React state and localStorage

### 4. **Security Features**
- Signature verification using `ethers.verifyMessage()`
- Stored signatures for potential server-side verification
- Unique nonce in messages (timestamp-based)
- Wallet address verification

## Testing Wallet Connection

### Prerequisites
1. Install a compatible wallet:
   - MetaMask (recommended)
   - Coinbase Wallet
   - Phantom (with Ethereum support enabled)

2. Ensure you have the Base network added:
   - The app will automatically prompt to add it if missing
   - Network details:
     - Chain ID: 8453 (0x2105)
     - Network Name: Base
     - RPC URL: https://mainnet.base.org
     - Explorer: https://basescan.org

### Testing Steps

1. **Open the browser console** (F12 or right-click → Inspect → Console)

2. **Click "CONNECT" button** in the app

3. **Select a wallet** from the list

4. **Watch the console** for debug messages:
   ```
   🔌 Attempting to connect wallet: metamask
   ✅ MetaMask detected
   🔗 Requesting account access...
   ✅ Wallet connected: 0x...
   🌐 Switching to Base network...
   ✅ Switched to Base network
   📝 Signing authentication message...
   ✅ Message signed successfully
   ✅ Signature verified
   🔍 Ensuring user exists in database...
   ✅ User ID: ...
   ✅ Wallet connection complete!
   ```

5. **Sign the message** when prompted by your wallet

6. **Verify connection**:
   - You should see your wallet address in the UI
   - Profile menu should appear
   - Check localStorage for stored data:
     - `wallet_address`
     - `wallet_network`
     - `wallet_type`
     - `wallet_signature`
     - `wallet_signed_message`

### Common Issues

#### "MetaMask not found"
- **Solution**: Install MetaMask extension or browser

#### "Failed to sign the message"
- **Solution**: Click "Sign" in the wallet popup when prompted
- Don't close or cancel the signature request

#### "Invalid signature"
- **Solution**: This should not happen unless there's a bug
- Report the issue with console logs

#### "Connection Failed" with no details
- **Solution**: Check browser console for detailed error messages
- Look for emoji indicators to identify where the process failed

## Technical Details

### File Structure
```
basement/
├── src/
│   ├── contexts/
│   │   └── WalletContext.tsx    # Main wallet connection logic
│   ├── components/
│   │   └── WalletButton.tsx     # UI for wallet selection
│   └── lib/
│       └── walletAuth.ts         # Signature verification utilities
```

### Key Functions

#### `generateAuthMessage(address: string)`
Generates a standardized authentication message for the wallet address.

#### `verifySignature(message, signature, expectedAddress)`
Verifies that a signature was created by the expected wallet address using `ethers.verifyMessage()`.

#### `connectEthereumWallet(walletType)`
Handles the complete connection flow including:
- Wallet detection
- Account request
- Network switching
- Message signing
- Signature verification
- Database sync

### Authentication Flow
```
User Clicks Connect
    ↓
Select Wallet (MetaMask/Coinbase/Phantom)
    ↓
Request Account Access
    ↓
Switch to Base Network
    ↓
Generate Auth Message
    ↓
Sign Message (wallet popup)
    ↓
Verify Signature
    ↓
Create/Update User in DB
    ↓
Store in localStorage
    ↓
Update React State
    ↓
User Authenticated ✓
```

## Future Enhancements

### Server-Side Verification
- Create Supabase Edge Function to verify signatures server-side
- Store verification status in database
- Add signature expiration logic

### Session Management
- Implement signature refresh after expiration
- Add "Remember Me" functionality
- Auto-connect on return visit

### Additional Features
- Multi-chain support (when ready to re-enable Solana)
- Wallet avatar/icons
- Connection history
- Sign message for specific actions (like transactions)

## Security Considerations

1. **Never store private keys**: We only use public wallet addresses and signatures
2. **Verify signatures**: Always verify signatures server-side for critical operations
3. **Use HTTPS**: Ensure the site is served over HTTPS in production
4. **Message format**: The message format includes origin to prevent replay attacks
5. **Nonce**: Timestamp-based nonce prevents signature reuse

## Troubleshooting

If you encounter issues:

1. **Check console logs**: Look for emoji indicators and error messages
2. **Clear localStorage**: `localStorage.clear()` in console
3. **Reload page**: Refresh and try again
4. **Check wallet extension**: Ensure it's enabled and updated
5. **Try different wallet**: Switch to another supported wallet

## Support

For issues or questions:
- Check the console for detailed error messages
- Review the code in `src/contexts/WalletContext.tsx`
- Verify wallet extension is properly installed and enabled

