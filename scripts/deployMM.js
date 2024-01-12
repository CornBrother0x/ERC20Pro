// Importing necessary modules from Hardhat
const hre = require("hardhat");

///notes
// Main function where deployment logic resides
async function main() {
  ///notes
  // Fetching the contract factory for 'MM'
  // The contract name must match the one used in your Solidity file
  const MM = await hre.ethers.getContractFactory("MM");

  ///notes
  // Deploying the contract
  // The 'deploy' method sends a transaction to deploy the contract
  console.log("Deploying MM...");
  const mm = await MM.deploy();

  ///notes
  // Waiting for the contract deployment to complete
  // Ensures that the contract is mined and deployed to the network
  await mm.deployed();

  ///notes
  // Confirming the contract deployment
  // Logs the address at which the contract is deployed
  console.log("MM deployed to:", mm.address);
}

///notes
// Handling errors and rejections in deployment
// Executes the main function and catches any potential errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
