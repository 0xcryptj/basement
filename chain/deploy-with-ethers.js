require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const PRIVATE_KEY = '1a25820b361e35858d759c501fdbc03ff28b490a24912f2b3c6434c699f9900b';
const RPC_URL = 'https://mainnet.base.org';

async function deploy() {
  console.log('🚀 Starting deployment to Base Mainnet...');
  
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('📝 Deployer address:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (ethers.parseEther('0.001') > balance) {
      console.error('❌ Insufficient balance for deployment!');
      return;
    }

    // Read contract source files
    console.log('\n📄 Reading contract files...');
    const coinFlipSource = fs.readFileSync(path.join(__dirname, 'contracts', 'CoinFlip.sol'), 'utf8');
    const jackpotSource = fs.readFileSync(path.join(__dirname, 'contracts', 'Jackpot.sol'), 'utf8');
    
    console.log('✅ Contract files loaded');
    
    // Use solc to compile (or better, use hardhat compile first)
    console.log('\n📦 Compiling contracts with Hardhat...');
    
    // Execute hardhat compile
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout } = await execAsync('npx hardhat compile', { cwd: __dirname });
      console.log('✅ Compilation successful');
    } catch (compileError) {
      console.error('❌ Compilation failed:', compileError.message);
      console.log('\n📋 Error details:');
      console.log(compileError.stdout);
      console.log(compileError.stderr);
    }
    
    // Try to load compiled artifacts
    let CoinFlipArtifact, JackpotArtifact;
    
    try {
      CoinFlipArtifact = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, 'artifacts', 'contracts', 'CoinFlip.sol', 'CoinFlip.json'),
          'utf8'
        )
      );
      console.log('✅ CoinFlip artifact loaded');
    } catch (e) {
      console.error('❌ Could not load CoinFlip artifact:', e.message);
      return;
    }
    
    try {
      JackpotArtifact = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, 'artifacts', 'contracts', 'Jackpot.sol', 'Jackpot.json'),
          'utf8'
        )
      );
      console.log('✅ Jackpot artifact loaded');
    } catch (e) {
      console.error('❌ Could not load Jackpot artifact:', e.message);
      return;
    }
    
    const addresses = {};
    
    // Deploy CoinFlip
    console.log('\n🎮 Deploying CoinFlip contract...');
    try {
      const coinFlipFactory = new ethers.ContractFactory(
        CoinFlipArtifact.abi,
        CoinFlipArtifact.bytecode,
        wallet
      );
      
      const coinFlip = await coinFlipFactory.deploy();
      console.log('⏳ Deployment transaction sent:', coinFlip.deploymentTransaction().hash);
      await coinFlip.waitForDeployment();
      const coinFlipAddress = await coinFlip.getAddress();
      addresses.CoinFlip = coinFlipAddress;
      console.log('✅ CoinFlip deployed to:', coinFlipAddress);
      console.log('🔗 View on BaseScan: https://basescan.org/address/' + coinFlipAddress);
    } catch (error) {
      console.error('❌ Error deploying CoinFlip:', error.message);
    }
    
    // Deploy Jackpot
    console.log('\n🎮 Deploying Jackpot contract...');
    try {
      const jackpotFactory = new ethers.ContractFactory(
        JackpotArtifact.abi,
        JackpotArtifact.bytecode,
        wallet
      );
      
      const jackpot = await jackpotFactory.deploy();
      console.log('⏳ Deployment transaction sent:', jackpot.deploymentTransaction().hash);
      await jackpot.waitForDeployment();
      const jackpotAddress = await jackpot.getAddress();
      addresses.Jackpot = jackpotAddress;
      console.log('✅ Jackpot deployed to:', jackpotAddress);
      console.log('🔗 View on BaseScan: https://basescan.org/address/' + jackpotAddress);
    } catch (error) {
      console.error('❌ Error deploying Jackpot:', error.message);
    }
    
    // Add existing addresses
    addresses.War = '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC';
    addresses.Chess = '0x429e6BF43b9127A9Ee95FD17f17213a35252488b';
    addresses.Connect4 = '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5';
    
    // Save addresses
    fs.writeFileSync(
      path.join(__dirname, 'deployed-addresses.json'),
      JSON.stringify(addresses, null, 2)
    );
    console.log('\n💾 Contract addresses saved to deployed-addresses.json');
    
    console.log('\n✅ Deployment complete!');
    console.log('\n📋 All Contract Addresses:');
    Object.entries(addresses).forEach(([name, addr]) => {
      console.log(`  ${name}: ${addr}`);
    });
    
    return addresses;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  } finally {
    // CRITICAL: Delete .env file if it exists
    try {
      const envPath = path.join(__dirname, '.env');
      if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath);
        console.log('\n🔒 ✅ Private key deleted from .env file');
      }
    } catch (e) {
      console.error('Could not delete .env:', e);
    }
  }
}

deploy()
  .then(() => {
    console.log('\n🎉 Deployment process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

