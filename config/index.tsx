import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, mainnet } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
// Using a fallback demo ID to prevent build errors
export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id'

// Warn if using demo ID
if (projectId === 'demo-project-id') {
  console.warn('⚠️ Using demo WalletConnect Project ID. Get yours at https://dashboard.reown.com')
}

// Define networks - Base as primary, mainnet as fallback
export const networks = [base, mainnet]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig

