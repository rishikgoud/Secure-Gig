const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy DAOToken first
    const DAOToken = await hre.ethers.getContractFactory("DAOToken");
    const daoToken = await DAOToken.deploy(deployer.address);
    await daoToken.waitForDeployment();
    const daoTokenAddress = await daoToken.getAddress();
    console.log("DAOToken deployed to:", daoTokenAddress);

    // Deploy GigEscrow
    const GigEscrow = await hre.ethers.getContractFactory("GigEscrow");
    const gigEscrow = await GigEscrow.deploy(deployer.address, deployer.address);
    await gigEscrow.waitForDeployment();
    const gigEscrowAddress = await gigEscrow.getAddress();
    console.log("GigEscrow deployed to:", gigEscrowAddress);

    // Deploy EscrowDAO
    const EscrowDAO = await hre.ethers.getContractFactory("EscrowDAO");
    const escrowDAO = await EscrowDAO.deploy(deployer.address, daoTokenAddress, gigEscrowAddress);
    await escrowDAO.waitForDeployment();
    const escrowDAOAddress = await escrowDAO.getAddress();
    console.log("EscrowDAO deployed to:", escrowDAOAddress);

    console.log("\nDeployment Summary:");
    console.log("==================");
    console.log("DAOToken:", daoTokenAddress);
    console.log("GigEscrow:", gigEscrowAddress);
    console.log("EscrowDAO:", escrowDAOAddress);
    console.log("Deployer:", deployer.address);
    console.log("Network:", hre.network.name);

    // Save deployment addresses to a JSON file for frontend integration
    const deploymentData = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      contracts: {
        DAOToken: daoTokenAddress,
        GigEscrow: gigEscrowAddress,
        EscrowDAO: escrowDAOAddress
      },
      deployer: deployer.address,
      deployedAt: new Date().toISOString()
    };

    const fs = require('fs');
    const path = require('path');
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment data
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`\nDeployment data saved to: ${deploymentFile}`);

    console.log("\n Add these to your .env file:");
    console.log("================================");
    console.log(`VITE_DAO_TOKEN_ADDRESS=${daoTokenAddress}`);
    console.log(`VITE_GIG_ESCROW_ADDRESS=${gigEscrowAddress}`);
    console.log(`VITE_ESCROW_DAO_ADDRESS=${escrowDAOAddress}`);
    console.log(`VITE_CHAIN_ID=${hre.network.config.chainId}`);

    console.log("\n Deployment completed successfully!");

  } catch (error) {
    console.error(" Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
