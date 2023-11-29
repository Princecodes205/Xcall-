const xCall = require("xcall-sdk");
const { ethers } = require("ethers");

const ethereumProvider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/877746fb37e046b68656774293b3073c"
);
const bscProvider = new ethers.providers.JsonRpcProvider(
  "https://bsc-mainnet.network.binance.com/"
);

const ethereumSigner = ethers.Wallet(
  "bf46e086f363f87788701a5389adf5b86a809ac8dfc9fe129c08d74ce6550657",
  ethereumProvider
);
const bscSigner = ethers.Wallet(
  "bf46e086f363f87788701a5389adf5b86a809ac8dfc9fe129c08d74ce6550657",
  bscProvider
);

const ethereumContractAddress = "0x...";
const bscContractAddress = "0x...";

const swapEtherForWETH = async (amount) => {
  const xCallClient = new xCall.Client();
  const ethereumContract = new ethers.Contract(
    ethereumContractAddress,
    xCall.ETH_CONTRACT_ABI,
    ethereumSigner
  );
  const bscContract = new ethers.Contract(
    bscContractAddress,
    xCall.BSC_CONTRACT_ABI,
    bscSigner
  );

  const message = {
    type: "swap",
    sourceChain: "ETH",
    sourceToken: "ETH",
    destinationChain: "BSC",
    destinationToken: "wETH",
    amount: amount,
  };

  const response = await xCallClient.send(message);
  const wETHAddress = response.data.wETHAddress;
  console.log(`Received wETH: ${wETHAddress}`);

  const tx = await ethereumContract.lockUpEth(amount, wETHAddress);
  await tx.wait();
};
