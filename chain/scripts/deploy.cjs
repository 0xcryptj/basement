const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment to Base Mainnet...");
  console.log("House Wallet:", process.env.HOUSE_WALLET || "Not set in .env");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.001")) {
    console.error("❌ Insufficient balance for deployment!");
    console.error("Please fund your deployer account with at least 0.001 ETH");
    process.exit(1);
  }

  const deployedAddresses = {};

  // Deploy Chess
  console.log("\n🎮 Deploying Chess contract...");
  const Chess = await hre.ethers.getContractFactory("Chess");
  const chess = await Chess.deploy();
  await chess.waitForDeployment();
  deployedAddresses.Chess = await chess.getAddress();
  console.log("✅ Chess deployed to:", deployedAddresses.Chess);

  // Deploy Connect4
  console.log("\n🎮 Deploying Connect4 contract...");
  const Connect4 = await hre.ethers.getContractFactory("Connect4");
  const connect4 = await Connect4.deploy();
  await connect4.waitForDeployment();
  deployedAddresses.Connect4 = await connect4.getAddress();
  console.log("✅ Connect4 deployed to:", deployedAddresses.Connect4);

  // Deploy War
  console.log("\n🎮 Deploying War contract...");
  const War = await hre.ethers.getContractFactory("War");
  const war = await War.deploy();
  await war.waitForDeployment();
  deployedAddresses.War = await war.getAddress();
  console.log("✅ War deployed to:", deployedAddresses.War);

  // Deploy CoinFlip
  console.log("\n🎮 Deploying CoinFlip contract...");
  const CoinFlip = await hre.ethers.getContractFactory("CoinFlip");
  const coinFlip = await CoinFlip.deploy();
  await coinFlip.waitForDeployment();
  deployedAddresses.CoinFlip = await coinFlip.getAddress();
  console.log("✅ CoinFlip deployed to:", deployedAddresses.CoinFlip);

  // Deploy Jackpot
  console.log("\n🎮 Deploying Jackpot contract...");
  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.deploy();
  await jackpot.waitForDeployment();
  deployedAddresses.Jackpot = await jackpot.getAddress();
  console.log("✅ Jackpot deployed to:", deployedAddresses.Jackpot);

  // Save addresses
  const addressesFile = "./deployed-addresses.json";
  fs.writeFileSync(addressesFile, JSON.stringify(deployedAddresses, null, 2));
  console.log("\n💾 Contract addresses saved to:", addressesFile);

  console.log("\n✅ All contracts deployed successfully!");
  console.log("\n📋 Summary:");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("House Wallet:", process.env.HOUSE_WALLET);
  console.log("\nContract Addresses:");
  Object.entries(deployedAddresses).forEach(([name, addr]) => {
    console.log(`  ${name}: ${addr}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

