const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Simulating MRV Flow with account:", deployer.address);

  // Use the addresses from the latest deployment
  const PROJECT_NFT_ADDRESS = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  const CARBON_TOKEN_ADDRESS = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
  const MRV_REGISTRY_ADDRESS = "0x9A676e781A523b5d0C0e43731313A708CB607508";

  console.log("--- Attaching to Deployed Contracts ---");
  const projectNFT = await ethers.getContractAt("AlgaeProjectNFT", PROJECT_NFT_ADDRESS);
  const carbonToken = await ethers.getContractAt("CarbonCreditToken", CARBON_TOKEN_ADDRESS);
  const mrvRegistry = await ethers.getContractAt("MRVRegistry", MRV_REGISTRY_ADDRESS);

  // Check if roles are already setup (they should be from deploy script)
  console.log("Contracts attached.");

  console.log("--- 1. Register Project ---");
  // Mint a Project NFT
  const tx1 = await projectNFT.registerProject(deployer.address, "ipfs://QmProjectMetadata");
  const receipt1 = await tx1.wait();
  
  // Find the Transfer event to get the tokenId
  const transferEvent = receipt1.logs.find(log => log.eventName === 'Transfer'); // ERC721 Transfer event
  // However, we might need to parse logs if eventName is not populated automatically
  // In Hardhat/Ethers v6 it's usually well parsed.
  // The Transfer event signature is Transfer(address from, address to, uint256 tokenId)
  // Let's just grab the token count
  const balance = await projectNFT.balanceOf(deployer.address);
  const tokenId = await projectNFT.tokenOfOwnerByIndex(deployer.address, balance - 1n); // Get the last one
  console.log(`Project registered with ID: ${tokenId}`);

  console.log("--- 2. Simulate Growth & Add Measurement ---");
  // Simulate growth data
  const biomassAmount = 100; // kg
  const co2Captured = 183;   // kg (1.83 * 100)
  const dataHash = "ipfs://QmRawSensorData";

  const tx2 = await mrvRegistry.addMeasurement(tokenId, biomassAmount, co2Captured, dataHash);
  const receipt2 = await tx2.wait();
  
  // Get measurement ID from logs? Or just query projectMeasurements
  const measurements = await mrvRegistry.getProjectMeasurements(tokenId);
  const measurementId = measurements[measurements.length - 1].id;
  console.log(`Measurement added with ID: ${measurementId}`);

  console.log("--- 3. Verify Measurement ---");
  // In reality, this would be a separate account with VERIFIER_ROLE
  // Here deployer has VERIFIER_ROLE by default constructor
  const tx3 = await mrvRegistry.verifyMeasurement(measurementId, true);
  await tx3.wait();
  console.log("Measurement verified.");

  console.log("--- 4. Issue Credits ---");
  const tx4 = await mrvRegistry.issueCredits(measurementId);
  await tx4.wait();
  console.log("Credits issued.");

  // Check balance
  const tokenBalance = await carbonToken.balanceOf(deployer.address);
  console.log(`Carbon Credit Balance: ${ethers.formatUnits(tokenBalance, 18)} ACC-B`);

  console.log("--- 5. Retire Credits ---");
  const retireAmount = ethers.parseUnits("50", 18); // Retire 50 credits
  const tx5 = await carbonToken.retire(retireAmount, "Compensação de voo corporativo (Simulação)");
  await tx5.wait();
  console.log("Credits retired.");

  const finalBalance = await carbonToken.balanceOf(deployer.address);
  console.log(`Final Carbon Credit Balance: ${ethers.formatUnits(finalBalance, 18)} ACC-B`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
