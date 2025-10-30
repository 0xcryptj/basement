const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

const PRIVATE_KEY = process.env.PRIVATE_KEY || (() => { throw new Error('PRIVATE_KEY environment variable required'); })();
const RPC_URL = 'https://mainnet.base.org';

// Read all contract dependencies
function readContracts() {
  const coinFlipPath = path.join(__dirname, 'contracts', 'CoinFlip.sol');
  const jackpotPath = path.join(__dirname, 'contracts', 'Jackpot.sol');
  
  const sources = {};
  
  sources['CoinFlip.sol'] = fs.readFileSync(coinFlipPath, 'utf8');
  sources['Jackpot.sol'] = fs.readFileSync(jackpotPath, 'utf8');
  
  return sources;
}

function compileContract(contractName, sources) {
  console.log(`\n📦 Compiling ${contractName}...`);
  
  const input = {
    language: 'Solidity',
    sources: sources,
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
  
  const output = JSON.parse(solc.compile(JSON.stringify(input), {
    import: (path) => {
      if (sources[path]) {
        return { contents: sources[path] };
      }
      return { error: 'File not found' };
    }
  }));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('Compilation errors:');
      errors.forEach(e => console.error(e.formattedMessage));
      throw new Error('Compilation failed');
    }
  }
  
  const contract = output.contracts[`${contractName}.sol`][contractName];
  
  if (!contract) {
    throw new Error(`Contract ${contractName} not found in compilation output`);
  }
  
  console.log(`✅ ${contractName} compiled successfully`);
  
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
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

    // Read and compile contracts
    console.log('\n📄 Reading contract files...');
    const sources = readContracts();
    console.log('✅ Contract files loaded');
    
    const addresses = {};
    
    // Compile and deploy CoinFlip
    console.log('\n🎮 Deploying CoinFlip contract...');
    try {
      const coinFlipCompiled = compileContract('CoinFlip', sources);
      
      const coinFlipFactory = new ethers.ContractFactory(
        coinFlipCompiled.abi,
        coinFlipCompiled.bytecode,
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
      const jackpotCompiled = compileContract('Jackpot', sources);
      
      const jackpotFactory = new ethers.ContractFactory(
        jackpotCompiled.abi,
        jackpotCompiled.bytecode,
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
    const existingPath = path.join(__dirname, 'deployed-addresses.json');
    if (fs.existsSync(existingPath)) {
      const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      addresses.War = existing.War;
      addresses.Chess = existing.Chess;
      addresses.Connect4 = existing.Connect4;
    }
    
    // Save addresses
    fs.writeFileSync(
      existingPath,
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

