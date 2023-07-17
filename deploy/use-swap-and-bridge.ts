import { Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load contract artifact. Make sure to compile first!
import * as ContractArtifact from "../artifacts-zk/contracts/Liquidity.sol/Liquidity.json";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// Address of the contract on zksync testnet
const CONTRACT_ADDRESS = process.env.LIQUIDITY_ADDRESS || "";

if (!CONTRACT_ADDRESS) throw "⛔️ Contract address not provided";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Initialize the provider.
  // @ts-ignore
  const provider = new Provider(hre.userConfig.networks?.zkSyncTestnet?.url);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  // Initialize contract instance
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ContractArtifact.abi,
    signer
  );
  
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "";
  const LINK_ADDRESS = process.env.LINK_ADDRESS || "";
  // Convert 0.0012 ETH to wei
  const _amountIn =  ethers.utils.parseUnits("200", 6);
  // Convert 2 USDT to smallest unit
  const _amountOut = ethers.utils.parseUnits("30");
  const _minConversionRate = ethers.utils.parseEther("0.1");
  // Encode the TokenActionsModule approve function call for the swap
  const approveForSwapData = ethers.utils.defaultAbiCoder.encode(
    ["bytes1", "address", "address", "uint256"],
    [0x03, USDC_ADDRESS, CONTRACT_ADDRESS, _amountIn]
  );

  // Encode the DexModule (KyberSwap) function call
  const dexModuleData = ethers.utils.defaultAbiCoder.encode(
    ["bytes1", "address", "address", "uint256", "bytes"],
    [0x01, USDC_ADDRESS, LINK_ADDRESS, _amountIn, _minConversionRate]
  );

  // Encode the TokenActionsModule approve function call for the bridge
  const approveForBridgeData = ethers.utils.defaultAbiCoder.encode(
    ["bytes1", "address", "address", "uint256"],
    [0x03, LINK_ADDRESS, CONTRACT_ADDRESS, _amountOut]
  );

  // Encode the GravityModule function call
  const gravityModuleData = ethers.utils.defaultAbiCoder.encode(
    ["bytes1", "address", "string", "uint256"],
    [0x02, LINK_ADDRESS, signer.address, _amountOut]
  );

  // Send the transaction
  const tx = await contract.multicall([approveForSwapData, dexModuleData, approveForBridgeData, gravityModuleData]);
  console.log(`Transaction to perform swap and bridge is ${tx.hash}`);
  await tx.wait();
}
