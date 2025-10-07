import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🎮 Deploying CoinToss contract to Base...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  const REVEAL_WINDOW = 1800; // 30 minutes
  console.log("Reveal window:", REVEAL_WINDOW, "seconds (30 minutes)");
  
  const CoinToss = await ethers.getContractFactory("CoinToss");
  console.log("Deploying CoinToss contract...");
  
  const coinToss = await CoinToss.deploy(REVEAL_WINDOW);
  await coinToss.waitForDeployment();
  
  const contractAddress = await coinToss.getAddress();
  console.log("✅ CoinToss deployed to:", contractAddress);
  
  // Save deployment info
  const deploymentInfo = {
    address: contractAddress,
    deployer: deployer.address,
    revealWindow: REVEAL_WINDOW,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };
  
  const deploymentPath = path.join(__dirname, "..", "..", "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info saved to deployment.json");
  
  // Generate ABI file
  const artifact = await ethers.getContractFactory("CoinToss");
  const abi = artifact.interface.formatJson();
  
  const abiPath = path.join(__dirname, "..", "..", "abi", "CoinToss.json");
  fs.writeFileSync(abiPath, abi);
  console.log("📝 ABI saved to abi/CoinToss.json");
  
  // Update arcade.js with contract address
  const arcadeJsPath = path.join(__dirname, "..", "..", "arcade", "arcade.js");
  if (fs.existsSync(arcadeJsPath)) {
    let arcadeJs = fs.readFileSync(arcadeJsPath, "utf8");
    arcadeJs = arcadeJs.replace(
      /const COIN_TOSS_ADDRESS = "0x[0-9a-fA-F]{40}";/,
      `const COIN_TOSS_ADDRESS = "${contractAddress}";`
    );
    fs.writeFileSync(arcadeJsPath, arcadeJs);
    console.log("📝 Updated arcade.js with contract address");
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Verify contract on Basescan:");
  console.log(`   npx hardhat verify --network base ${contractAddress} ${REVEAL_WINDOW}`);
  console.log("\n2. Test the arcade at: http://localhost:8000/arcade/arcade.html");
  console.log("\n3. Contract address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

