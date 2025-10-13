import { ethers } from "hardhat";

async function main() {
  console.log("🎮 Deploying BasementArcade Contract to Base Network...\n");

  // Basement Token Address on Base
  const BASEMENT_TOKEN = "0xcf4abb42b4b47eb242eabab5c9a9913bcad9ca23";

  console.log("Token Address:", BASEMENT_TOKEN);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("\n📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy BasementArcade
  console.log("🚀 Deploying BasementArcade...");
  const BasementArcade = await ethers.getContractFactory("BasementArcade");
  const arcade = await BasementArcade.deploy(BASEMENT_TOKEN);

  await arcade.waitForDeployment();
  const arcadeAddress = await arcade.getAddress();

  console.log("✅ BasementArcade deployed to:", arcadeAddress);

  // Verify configuration
  console.log("\n🔍 Verifying deployment...");
  const tokenAddress = await arcade.basementToken();
  const houseAddress = await arcade.house();
  const minBalance = await arcade.MIN_TOKEN_BALANCE();
  const feeNoToken = await arcade.FEE_BPS_NO_TOKEN();
  const feeWithToken = await arcade.FEE_BPS_WITH_TOKEN();

  console.log("Token Address:", tokenAddress);
  console.log("House Address:", houseAddress);
  console.log("Min Token Balance:", ethers.formatEther(minBalance), "tokens");
  console.log("Fee (No Token):", feeNoToken.toString(), "bps (5%)");
  console.log("Fee (With Token):", feeWithToken.toString(), "bps (2.5%)");

  // Export deployment info
  const deploymentInfo = {
    network: "base",
    chainId: 8453,
    contracts: {
      basementToken: BASEMENT_TOKEN,
      basementArcade: arcadeAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    configuration: {
      minTokenBalance: ethers.formatEther(minBalance),
      feeNoToken: "5%",
      feeWithToken: "2.5%",
      revealWindow: "300 seconds",
    },
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend with contract address:", arcadeAddress);
  console.log("2. Verify contract on BaseScan:");
  console.log(`   https://basescan.org/address/${arcadeAddress}`);
  console.log("3. Test token holder benefits");
  console.log("4. Update arcade.js with new contract address\n");

  // Save deployment info to file
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '../deployments/base-arcade.json');
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 Deployment info saved to:", outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

