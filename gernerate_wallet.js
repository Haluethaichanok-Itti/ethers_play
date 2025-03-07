// const { ethers } = require("ethers");

import { ethers } from "ethers";
// Function to generate wallet address
export function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  console.log("Wallet Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
}

// Call the function to generate wallet
// generateWallet();
