import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LuckyBlock contract to Base...");

  // Get the contract factory
  const LuckyBlock = await ethers.getContractFactory("LuckyBlock");
  
  // Deploy the contract
  console.log("Deploying...");
  const luckyBlock = await LuckyBlock.deploy();
  
  await luckyBlock.waitForDeployment();
  
  const address = await luckyBlock.getAddress();
  
  console.log("✅ LuckyBlock deployed to:", address);
  console.log("\n📝 Update the CONTRACT_ADDRESS in luckyblock.html with:", address);
  
  // Get initial round info
  const currentRound = await luckyBlock.getCurrentRound();
  console.log("\n🎰 Initial Round Info:");
  console.log("  - Round ID:", currentRound[0].toString());
  console.log("  - Entry Fee:", ethers.formatEther(currentRound[3]), "ETH");
  console.log("  - Round Duration: 2 minutes");
  console.log("  - Max Players: 20");
  console.log("  - Min Players: 2");
  
  console.log("\n🔍 Verify contract on Basescan:");
  console.log(`npx hardhat verify --network base ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

