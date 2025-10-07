import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Connect4 contract...");

    const Connect4 = await ethers.getContractFactory("Connect4");
    const connect4 = await Connect4.deploy();
    
    await connect4.waitForDeployment();
    const address = await connect4.getAddress();

    console.log("✅ Connect4 deployed to:", address);
    console.log("\n📋 Next steps:");
    console.log("1. Update CONNECT4_ADDRESS in arcade.js");
    console.log("2. Test the arcade at http://localhost:8000/arcade/arcade.html");
    console.log("\n💰 House wallet:", "0x5Da407f983e0f11B3f7F67Acd64877b42B22068D");
    console.log("🎮 Fee: 5% per player (not shown to users)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

