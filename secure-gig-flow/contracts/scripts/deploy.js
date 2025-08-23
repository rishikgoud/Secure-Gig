const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Avalanche Fuji testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

  try {
    // 1. Deploy DAO Token
    console.log("📄 Deploying DAOToken...");
    const DAOToken = await ethers.getContractFactory("DAOToken");
    const daoToken = await DAOToken.deploy(deployer.address);
    await daoToken.waitForDeployment();
    const daoTokenAddress = await daoToken.getAddress();
    console.log("✅ DAOToken deployed to:", daoTokenAddress);

    // 2. Deploy Escrow Contract
    console.log("\n📄 Deploying Escrow...");
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(deployer.address, deployer.address); // owner and fee recipient
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("✅ Escrow deployed to:", escrowAddress);

    // 3. Deploy DAO Contract
    console.log("\n📄 Deploying EscrowDAO...");
    const EscrowDAO = await ethers.getContractFactory("EscrowDAO");
    const escrowDAO = await EscrowDAO.deploy(deployer.address, daoTokenAddress, escrowAddress);
    await escrowDAO.waitForDeployment();
    const escrowDAOAddress = await escrowDAO.getAddress();
    console.log("✅ EscrowDAO deployed to:", escrowDAOAddress);

    // 4. Configure contracts
    console.log("\n⚙️  Configuring contracts...");
    
    // Set DAO contract in Escrow
    const setDAOTx = await escrow.setDAOContract(escrowDAOAddress);
    await setDAOTx.wait();
    console.log("✅ DAO contract set in Escrow");

    // Mint some tokens for testing
    const mintAmount = ethers.parseEther("10000"); // 10,000 tokens
    const testAddresses = [
      deployer.address,
      "0x742d35Cc6634C0532925a3b8D0C9C3f6692c8b4c", // Example test address
      "0x8ba1f109551bD432803012645Hac136c22C177ec", // Example test address
    ];

    for (const address of testAddresses) {
      try {
        const mintTx = await daoToken.mint(address, mintAmount);
        await mintTx.wait();
        console.log(`✅ Minted ${ethers.formatEther(mintAmount)} tokens to ${address}`);
      } catch (error) {
        console.log(`⚠️  Could not mint to ${address} (address may be invalid)`);
      }
    }

    // 5. Verification info
    console.log("\n📋 Deployment Summary:");
    console.log("====================");
    console.log("DAOToken:", daoTokenAddress);
    console.log("Escrow:", escrowAddress);
    console.log("EscrowDAO:", escrowDAOAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);

    // 6. Save deployment info
    const deploymentInfo = {
      network: (await ethers.provider.getNetwork()).name,
      chainId: Number((await ethers.provider.getNetwork()).chainId),
      deployer: deployer.address,
      contracts: {
        DAOToken: daoTokenAddress,
        Escrow: escrowAddress,
        EscrowDAO: escrowDAOAddress,
      },
      deployedAt: new Date().toISOString(),
    };

    const fs = require("fs");
    const path = require("path");
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, `fuji-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFile);

    // 7. Environment variables template
    console.log("\n📝 Add these to your .env file:");
    console.log("================================");
    console.log(`VITE_DAO_TOKEN_ADDRESS=${daoTokenAddress}`);
    console.log(`VITE_ESCROW_ADDRESS=${escrowAddress}`);
    console.log(`VITE_ESCROW_DAO_ADDRESS=${escrowDAOAddress}`);
    console.log(`VITE_CHAIN_ID=43113`);

    console.log("\n🎉 Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
