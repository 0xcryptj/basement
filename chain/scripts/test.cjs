const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing contracts on local Hardhat network...");
  
  const [deployer, player1, player2] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Player1:", player1.address);
  console.log("Player2:", player2.address);

  // Deploy contracts
  console.log("\n📦 Deploying contracts...");
  const Chess = await hre.ethers.getContractFactory("Chess");
  const chess = await Chess.deploy();
  await chess.waitForDeployment();
  
  const Connect4 = await hre.ethers.getContractFactory("Connect4");
  const connect4 = await Connect4.deploy();
  await connect4.waitForDeployment();
  
  const War = await hre.ethers.getContractFactory("War");
  const war = await War.deploy();
  await war.waitForDeployment();

  console.log("✅ All contracts deployed");

  const wager = hre.ethers.parseEther("0.001");

  // Test 1: Create Chess game
  console.log("\n📝 Test 1: Create Chess game");
  const tx1 = await chess.connect(player1).createGame({ value: wager });
  await tx1.wait();
  const game1 = await chess.games(1);
  console.log("✅ Chess game created by player1 with wager:", hre.ethers.formatEther(game1.wager), "ETH");

  // Test 2: Create War game
  console.log("\n📝 Test 2: Create War game");
  const tx2 = await war.connect(player1).createGame({ value: wager });
  await tx2.wait();
  const warGame = await war.games(1);
  console.log("✅ War game created");

  // Test 3: Create Connect4 game
  console.log("\n📝 Test 3: Create Connect4 game");
  const tx3 = await connect4.connect(player1).createGame({ value: wager });
  await tx3.wait();
  console.log("✅ Connect4 game created");

  console.log("\n✅ All basic tests passed! Contracts are working correctly.");
  
  // Display house wallet
  const houseWallet = await chess.houseWallet();
  console.log("\n🏠 House wallet configured:", houseWallet);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

