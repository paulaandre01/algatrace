const { ethers } = require("hardhat");

async function main() {
    const address = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
    const AlgaeProjectNFT = await ethers.getContractFactory("AlgaeProjectNFT");
    const contract = AlgaeProjectNFT.attach(address);

    const [signer] = await ethers.getSigners();
    console.log("Testing registerProject with account:", signer.address);

    try {
        const tx = await contract.registerProject(signer.address, "test-uri");
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed!");
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}

main().catch(console.error);