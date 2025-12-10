const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy IdentityRegistry
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("IdentityRegistry deployed to:", identityRegistryAddress);

  // Deploy CredentialManager
  const CredentialManager = await hre.ethers.getContractFactory("CredentialManager");
  const credentialManager = await CredentialManager.deploy();
  await credentialManager.waitForDeployment();
  const credentialManagerAddress = await credentialManager.getAddress();
  console.log("CredentialManager deployed to:", credentialManagerAddress);

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    IdentityRegistry: identityRegistryAddress,
    CredentialManager: credentialManagerAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./frontend/src/contracts/deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to frontend/src/contracts/deployments.json");
  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
