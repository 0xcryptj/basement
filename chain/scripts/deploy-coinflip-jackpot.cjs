const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying CoinFlip and Jackpot to Base Mainnet...");
  console.log("House Wallet:", process.env.HOUSE_WALLET || "0x5CAdda44709251088663E94b13ad3d5E38466b4d");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.001")) {
    console.error("❌ Insufficient balance for deployment!");
    console.error("Please fund your deployer account with at least 0.001 ETH");
    process.exit(1);
  }

  // Read existing addresses
  let deployedAddresses = {};
  try {
    const existing = fs.readFileSync("./deployed-addresses.json", "utf8");
    deployedAddresses = JSON.parse(existing);
    console.log("\n📋 Existing deployed contracts:", Object.keys(deployedAddresses));
  } catch (e) {
    console.log("No existing deployed-addresses.json, creating new one");
  }

  // Deploy CoinFlip
  console.log("\n🎮 Deploying CoinFlip contract...");
  try {
    const CoinFlip = await hre.ethers.getContractFactory("CoinFlip");
    const coinFlip = await CoinFlip.deploy();
    await coinFlip.waitForDeployment();
    const coinFlipAddress = await coinFlip.getAddress();
    deployedAddresses.CoinFlip = coinFlipAddress;
    console.log("✅ CoinFlip deployed to:", coinFlipAddress);
    console.log("🔗 View on BaseScan: https://basescan.org/address/" + coinFlipAddress);
  } catch (error) {
    console.error("❌ Error deploying CoinFlip:", error.message);
  }

  // Deploy Jackpot
  console.log("\n🎮 Deploying Jackpot contract...");
  try {
    const Jackpot = await hre.ethers.getContractFactory("Jackpot");
    const jackpot = await Jackpot.deploy();
    await jackpot.waitForDeployment();
    const jackpotAddress = await jackpot.getAddress();
    deployedAddresses.Jackpot = jackpotAddress;
    console.log("✅ Jackpot deployed to:", jackpotAddress);
    console.log("🔗 View on BaseScan: https://basescan.org/address/" + jackpotAddress);
  } catch (error) {
    console.error("❌ Error deploying Jackpot:", error.message);
  }

  // Save addresses
  const addressesFile = "./deployed-addresses.json";
  fs.writeFileSync(addressesFile, JSON.stringify(deployedAddresses, null, 2));
  console.log("\n💾 Contract addresses saved to:", addressesFile);

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 All Contract Addresses:");
  Object.entries(deployedAddresses).forEach(([name, addr]) => {
    console.log(`  ${name}: ${addr}`);
  });
  
  console.log("\n⚠️  IMPORTANT: Update src/lib/contracts.ts with the new addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

