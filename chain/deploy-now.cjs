const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRIVATE_KEY = process.env.PRIVATE_KEY || (() => { throw new Error('PRIVATE_KEY environment variable required'); })();
const RPC_URL = 'https://mainnet.base.org';

async function compileContract(contractName) {
  console.log(`\n📦 Compiling ${contractName}...`);
  
  try {
    // Use npx hardhat compile with specific config
    const configPath = path.join(__dirname, 'hardhat.config.cjs');
    const contractsPath = path.join(__dirname, 'contracts', `${contractName}.sol`);
    
    // Check if contract exists
    if (!fs.existsSync(contractsPath)) {
      throw new Error(`Contract file not found: ${contractsPath}`);
    }
    
    // Run hardhat compile
    execSync(`npx hardhat compile --config ${configPath}`, {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    // Load artifact
    const artifactPath = path.join(
      __dirname,
      'artifacts',
      'contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found after compilation: ${artifactPath}`);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    console.log(`✅ ${contractName} compiled successfully`);
    return artifact;
  } catch (error) {
    console.error(`❌ Error compiling ${contractName}:`, error.message);
    throw error;
  }
}

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

    const addresses = {};
    
    // Compile and deploy CoinFlip
    console.log('\n🎮 Deploying CoinFlip contract...');
    try {
      const coinFlipArtifact = await compileContract('CoinFlip');
      
      const coinFlipFactory = new ethers.ContractFactory(
        coinFlipArtifact.abi,
        coinFlipArtifact.bytecode,
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
      throw error;
    }
    
    // Compile and deploy Jackpot
    console.log('\n🎮 Deploying Jackpot contract...');
    try {
      const jackpotArtifact = await compileContract('Jackpot');
      
      const jackpotFactory = new ethers.ContractFactory(
        jackpotArtifact.abi,
        jackpotArtifact.bytecode,
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
      throw error;
    }
    
    // Add existing addresses
    const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployed-addresses.json'), 'utf8'));
    addresses.War = existing.War;
    addresses.Chess = existing.Chess;
    addresses.Connect4 = existing.Connect4;
    
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

