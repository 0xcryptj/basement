import { ethers } from "hardhat";

async function main() {
    console.log("Deploying War contract...");

    const REVEAL_WINDOW = 1800; // 30 minutes in seconds

    const War = await ethers.getContractFactory("War");
    const war = await War.deploy(REVEAL_WINDOW);
    
    await war.waitForDeployment();
    const address = await war.getAddress();

    console.log("✅ War deployed to:", address);
    console.log("⏱️  Reveal window:", REVEAL_WINDOW, "seconds (30 minutes)");
    console.log("\n📋 Next steps:");
    console.log("1. Update WAR_ADDRESS in arcade.js");
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

