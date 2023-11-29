const Web3 = require("web3");
const BridgeEth = require("../build/contracts/BridgeEth.json");
const BridgeBsc = require("../build/contracts/BridgeBsc.json");
const dotenv = require("dotenv");
dotenv.config();

const web3Eth = new Web3(
  "https://mainnet.infura.io/v3/877746fb37e046b68656774293b3073c"
); //env

const HDWalletProvider = require("@truffle/hdwallet-provider");

const provider = new HDWalletProvider(
  [process.env.PRIVATE_KEY1],
  "https://data-seed-prebsc-1-s1.binance.org:8545"
);
const web3Bsc = new Web3(provider);

const admin = web3Bsc.eth.accounts.privateKeyToAccount(
  process.env.PRIVATE_KEY1
);
console.log("Admin address:", admin.address);

// const web3Bsc = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545"); //env
// const { address: admin } = web3Bsc.eth.accounts.wallet.add(
//   process.env.PRIVATE_KEY1
// );
// console.log("ooafdfdfkkk", address);

const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks["4"].address
);

const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  BridgeBsc.networks["97"].address
);

bridgeEth.events
  .Transfer({ fromBlock: 0, step: 0 })
  .on("data", async (event) => {
    const { from, to, amount, date, nonce } = event.returnValues;

    const tx = bridgeBsc.methods.mint(to, amount, nonce);
    const [gasPrice, gasCost] = await Promise.all([
      web3Bsc.eth.getGasPrice(),
      tx.estimateGas({ from: admin }),
    ]);
    const data = tx.encodeABI();
    const txData = {
      from: admin,
      to: bridgeBsc.options.address,
      data,
      gas: gasCost,
      gasPrice,
    };
    const receipt = await web3Bsc.eth.sendTransaction(txData);
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`
    Processed transfer:
    - from ${from} 
    - to ${to} 
    - amount ${amount} tokens
    - date ${date}
  `);
  });
