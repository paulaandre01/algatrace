const { ethers } = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  const recipient = args[0];

  if (!recipient) {
    console.error("Please provide a recipient address.");
    console.error("Usage: npx hardhat run scripts/fund.js --network localhost -- <ADDRESS>");
    return;
  }

  const [sender] = await ethers.getSigners();
  const amount = ethers.parseEther("100.0");

  console.log(`Sending 100 ETH from ${sender.address} to ${recipient}...`);

  const tx = await sender.sendTransaction({
    to: recipient,
    value: amount,
  });

  await tx.wait();
  console.log(`Transferred 100 ETH. Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
