// config/blockchain.js - Cấu hình kết nối Smart Contract
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

// Đọc ABI từ file DNCTraceABI.json
const abiPath = path.join(__dirname, "../../client/contracts/DNCTraceABI.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

// Tạo Provider (đọc dữ liệu từ blockchain) và Contract instance
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

module.exports = { provider, contract, CONTRACT_ADDRESS, RPC_URL };