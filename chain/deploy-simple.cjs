const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Use private key from environment
const PRIVATE_KEY = process.env.PRIVATE_KEY || (() => { throw new Error('PRIVATE_KEY environment variable required'); })();
const RPC_URL = 'https://mainnet.base.org';

// Compile contract using solc directly
function compileContract(contractName) {
  console.log(`📦 Compiling ${contractName}...`);
  
  const contractPath = path.join(__dirname, 'contracts', `${contractName}.sol`);
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found: ${contractPath}`);
  }
  
  const contractSource = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: {
        content: contractSource
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:');
      errors.forEach(e => console.error(e.formattedMessage || e.message));
      throw new Error(`Compilation failed for ${contractName}`);
    }
  }
  
  const compiled = output.contracts[`${contractName}.sol`][contractName];
  if (!compiled) {
    throw new Error(`Contract ${contractName} not found in compilation output`);
  }
  
  console.log(`✅ ${contractName} compiled successfully`);
  
  return {
    abi: compiled.abi,
    bytecode: compiled.evm.bytecode.object
  };
}

async function getCompiledContract(contractName) {
  // Always compile with solc (no hardhat dependency)
  return compileContract(contractName);
}

async function deploy() {
  console.log('🚀 Starting deployment to Base Mainnet...');
  console.log('📝 Deployer address will be derived from private key');
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('📝 Deployer address:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (ethers.parseEther('0.001') > balance) {
      throw new Error('Insufficient balance for deployment! Need at least 0.001 ETH');
    }

    const addresses = {};
    
    // Deploy CoinFlip
    console.log('\n🎮 Deploying CoinFlip contract...');
    try {
      const coinFlipArtifact = await getCompiledContract('CoinFlip');
      
      const factory = new ethers.ContractFactory(
        coinFlipArtifact.abi,
        coinFlipArtifact.bytecode,
        wallet
      );
      
      console.log('⏳ Sending deployment transaction...');
      const contract = await factory.deploy();
      console.log('📤 Transaction hash:', contract.deploymentTransaction().hash);
      
      console.log('⏳ Waiting for deployment confirmation...');
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      addresses.CoinFlip = address;
      console.log('✅ CoinFlip deployed to:', address);
      console.log('🔗 https://basescan.org/address/' + address);
    } catch (error) {
      console.error('❌ Error deploying CoinFlip:', error.message);
      throw error;
    }
    
    // Deploy Jackpot
    console.log('\n🎮 Deploying Jackpot contract...');
    try {
      const jackpotArtifact = await getCompiledContract('Jackpot');
      
      const factory = new ethers.ContractFactory(
        jackpotArtifact.abi,
        jackpotArtifact.bytecode,
        wallet
      );
      
      console.log('⏳ Sending deployment transaction...');
      const contract = await factory.deploy();
      console.log('📤 Transaction hash:', contract.deploymentTransaction().hash);
      
      console.log('⏳ Waiting for deployment confirmation...');
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      addresses.Jackpot = address;
      console.log('✅ Jackpot deployed to:', address);
      console.log('🔗 https://basescan.org/address/' + address);
    } catch (error) {
      console.error('❌ Error deploying Jackpot:', error.message);
      throw error;
    }
    
    // Load existing addresses
    const existingPath = path.join(__dirname, 'deployed-addresses.json');
    let existing = {};
    if (fs.existsSync(existingPath)) {
      existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    }
    
    addresses.War = existing.War || '0xe6c00D7765D592A1D28A5AaB11ffeF37d7A726bC';
    addresses.Chess = existing.Chess || '0x429e6BF43b9127A9Ee95FD17f17213a35252488b';
    addresses.Connect4 = existing.Connect4 || '0x76Ff072AE1230133e7e570aCE2a5bBc5172BE0e5';
    
    // Save
    fs.writeFileSync(existingPath, JSON.stringify(addresses, null, 2));
    console.log('\n💾 Saved addresses to deployed-addresses.json');
    
    console.log('\n✅ DEPLOYMENT COMPLETE!');
    console.log('\n📋 Contract Addresses:');
    Object.entries(addresses).forEach(([name, addr]) => {
      console.log(`  ${name}: ${addr}`);
    });
    
    return addresses;
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
}

deploy()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
