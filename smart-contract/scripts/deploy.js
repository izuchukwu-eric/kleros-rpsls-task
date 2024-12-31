const hre = require("hardhat");
const fs = require("fs");

const main = async () => {
    const RPSContract = await hre.ethers.getContractFactory("RPS");
    const rps = await RPSContract.deploy();
    await rps.waitForDeployment();
  
    console.log("RPS deployed to:", `${await rps.getAddress()}`);
}
  
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})