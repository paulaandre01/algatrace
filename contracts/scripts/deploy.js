const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy AlgaeProjectNFT
  const AlgaeProjectNFT = await ethers.getContractFactory("AlgaeProjectNFT");
  const projectNFT = await AlgaeProjectNFT.deploy();
  await projectNFT.waitForDeployment();
  const projectNFTAddress = await projectNFT.getAddress();
  console.log("AlgaeProjectNFT deployed to:", projectNFTAddress);

  // 2. Deploy CarbonCreditToken
  const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
  const carbonToken = await CarbonCreditToken.deploy();
  await carbonToken.waitForDeployment();
  const carbonTokenAddress = await carbonToken.getAddress();
  console.log("CarbonCreditToken deployed to:", carbonTokenAddress);

  // 3. Deploy MRVRegistry
  const MRVRegistry = await ethers.getContractFactory("MRVRegistry");
  const mrvRegistry = await MRVRegistry.deploy(carbonTokenAddress, projectNFTAddress);
  await mrvRegistry.waitForDeployment();
  const mrvRegistryAddress = await mrvRegistry.getAddress();
  console.log("MRVRegistry deployed to:", mrvRegistryAddress);

  // Setup roles
  // Grant MINTER_ROLE to MRVRegistry so it can mint Carbon Credits
  const MINTER_ROLE = await carbonToken.MINTER_ROLE();
  await carbonToken.grantRole(MINTER_ROLE, mrvRegistryAddress);
  console.log("Granted MINTER_ROLE to MRVRegistry");

  // Output addresses for frontend usage
  const envContent = `NEXT_PUBLIC_ALGAE_PROJECT_NFT_ADDRESS=${projectNFTAddress}
NEXT_PUBLIC_CARBON_CREDIT_TOKEN_ADDRESS=${carbonTokenAddress}
NEXT_PUBLIC_MRV_REGISTRY_ADDRESS=${mrvRegistryAddress}
`;

  const envPath = path.join(__dirname, "../../frontend/.env.local");
  fs.writeFileSync(envPath, envContent);
  console.log("Updated frontend/.env.local with new addresses");

  console.log({
    AlgaeProjectNFT: projectNFTAddress,
    CarbonCreditToken: carbonTokenAddress,
    MRVRegistry: mrvRegistryAddress,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
