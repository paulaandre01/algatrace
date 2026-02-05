const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const sender = accounts[0]; // The pre-funded account
  const receiverAddress = process.env.RECEIVER_ADDRESS;

  if (!receiverAddress) {
    console.error("Please provide a RECEIVER_ADDRESS environment variable.");
    process.exit(1);
  }

  console.log(`Sending 10 ETH from ${sender.address} to ${receiverAddress}...`);

  const tx = await sender.sendTransaction({
    to: receiverAddress,
    value: hre.ethers.parseEther("10.0"),
  });

  await tx.wait();

  console.log(`Transaction successful! Hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
