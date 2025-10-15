import { ethers } from "hardhat";

async function main() {
    console.log("🎮 Deploying all arcade contracts...\n");

    // Deploy CoinToss
    console.log("1️⃣  Deploying CoinToss...");
    const CoinToss = await ethers.getContractFactory("CoinToss");
    const coinToss = await CoinToss.deploy(1800); // 30 min reveal
    await coinToss.waitForDeployment();
    const coinTossAddress = await coinToss.getAddress();
    console.log("✅ CoinToss deployed to:", coinTossAddress);

    // Deploy Connect4
    console.log("\n2️⃣  Deploying Connect4...");
    const Connect4 = await ethers.getContractFactory("Connect4");
    const connect4 = await Connect4.deploy();
    await connect4.waitForDeployment();
    const connect4Address = await connect4.getAddress();
    console.log("✅ Connect4 deployed to:", connect4Address);

    // Deploy War
    console.log("\n3️⃣  Deploying War...");
    const War = await ethers.getContractFactory("War");
    const war = await War.deploy(1800); // 30 min reveal
    await war.waitForDeployment();
    const warAddress = await war.getAddress();
    console.log("✅ War deployed to:", warAddress);

    // Deploy Lucky Block
    console.log("\n4️⃣  Deploying LuckyBlock...");
    const LuckyBlock = await ethers.getContractFactory("LuckyBlock");
    const luckyBlock = await LuckyBlock.deploy();
    await luckyBlock.waitForDeployment();
    const luckyBlockAddress = await luckyBlock.getAddress();
    console.log("✅ LuckyBlock deployed to:", luckyBlockAddress);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL CONTRACTS DEPLOYED!");
    console.log("=".repeat(60));
    console.log("\n📋 UPDATE THESE ADDRESSES:");
    console.log("\nIn arcade.js:");
    console.log(`const COIN_TOSS_ADDRESS = "${coinTossAddress}";`);
    console.log(`const CONNECT4_ADDRESS = "${connect4Address}";`);
    console.log(`const WAR_ADDRESS = "${warAddress}";`);
    console.log("\nIn luckyblock.html:");
    console.log(`const CONTRACT_ADDRESS = "${luckyBlockAddress}";`);
    console.log("\n💰 House wallet: 0x5Da407f983e0f11B3f7F67Acd64877b42B22068D");
    console.log("🎮 Fee: 5% per player/entry");
    console.log("\n🚀 Test games at:");
    console.log("   - http://localhost:8000/arcade/arcade.html");
    console.log("   - http://localhost:8000/arcade/luckyblock.html");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

