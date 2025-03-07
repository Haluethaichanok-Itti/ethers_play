import express from "express";
import bodyParser from "body-parser";
import { ethers } from "ethers";

const app = express();
const port = 3000;

const bscProvider = new ethers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
); // BSC RPC URL

const provider = new ethers.JsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545/"
);

// // สร้าง provider สำหรับ Optimism
// const optimismProvider = new ethers.JsonRpcProvider(
//   "https://optimism.mainnet.rpc.org"
// ); // หรือ URL ของ Optimism RPC ที่คุณใช้งาน

const optimismProvider = new ethers.JsonRpcProvider(
  "https://optimism-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post("/generate-wallet", (req, res) => {
  const wallet = ethers.Wallet.createRandom();
  res.json({ address: wallet.address, privateKey: wallet.privateKey });
});

app.post("/deposit", async (req, res) => {
  const { amount, toAddress, privateKey } = req.body;
  if (!privateKey) {
    return res.status(400).json({ error: "Private key is required" });
  }

  const wallet = new ethers.Wallet(privateKey, bscProvider);

  try {
    const a = await depositToContract(wallet, amount, toAddress);
    res.status(200).send("Deposit Successful");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

async function depositToContract(wallet, amount, toAddress) {
  const tokenContract = new ethers.Contract(
    // "TOKEN_CONTRACT_ADDRESS", // Replace with actual token contract address
    toAddress,
    ["function transfer(address to, uint256 amount) public returns (bool)"],
    wallet
  );

  const tx = await tokenContract.transfer(toAddress, amount);
  await tx.wait(); // Wait for the transaction to be confirmed
  console.log(`Deposited ${amount} tokens to ${toAddress}`);
}

app.post("/withdraw", async (req, res) => {
  const { amount, privateKey } = req.body;
  const wallet = new ethers.Wallet(privateKey, optimismProvider);

  try {
    await withdrawFromContract(wallet, amount, privateKey);
    res.status(200).send("Withdrawal Successful");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ฟังก์ชันสำหรับการถอน
async function withdrawFromContract(wallet, amount, toAddress) {
  const tokenContract = new ethers.Contract(
    toAddress, // ใส่ contract address ที่นี่
    ["function transfer(address to, uint256 amount) public returns (bool)"],
    wallet
  );

  // เรียกใช้ฟังก์ชัน transfer ใน contract
  const tx = await tokenContract.transfer(toAddress, amount);
  await tx.wait(); // รอการยืนยันธุรกรรม
  console.log(`Withdrawn ${amount} tokens to ${toAddress}`);
}

app.post("/wallet", (req, res) => {
  res.send("Hello, World!");
});

app.post("/balance", async (req, res) => {
  const { address } = req.body;
  try {
    const balance = await getBalance(address);
    console.log("balance", typeof balance, balance);
    res.status(200).send("Balance retrieved successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Example: using Binance Smart Chain as provider
const providerBsc = new ethers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);

const providerOptimism = new ethers.JsonRpcProvider(
  "https://mainnet.optimism.io"
);

async function getBalance(walletAddress) {
  try {
    const balance = await providerBsc.getBalance(walletAddress);
    const number = ethers.getNumber(balance);
    return number;
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

app.post("/transaction", async (req, res) => {
  const { amount, privateKey } = req.body;
  // const wallet = new ethers.Wallet(privateKey, bscProvider);
  const txResponse = await wallet.sendTransaction({
    to: "0xRecipientAddress",
    value: ethers.utils.parseEther("0.01"), // ส่ง 0.01 BNB
  });

  console.log("Transaction Sent:", txResponse.hash);

  // รอให้ธุรกรรมถูกยืนยัน
  const receipt = await txResponse.wait();

  console.log("Transaction Confirmed!");
  console.log("Transaction Receipt:", receipt);
});
