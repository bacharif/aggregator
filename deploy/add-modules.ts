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

  // Set DexModule
  const dexModuleTx = await contract.setModule("0x01", process.env.DEX_MODULE_ADDRESS);
  console.log(`Transaction to set DexModule is ${dexModuleTx.hash}`);
  await dexModuleTx.wait();

  // Set GravityModule
  const gravityModuleTx = await contract.setModule("0x02", process.env.GRAVITY_MODULE_ADDRESS);
  console.log(`Transaction to set GravityModule is ${gravityModuleTx.hash}`);
  await gravityModuleTx.wait();

  // Set TokenActionsModule
  const tokenActionsModuleTx = await contract.setModule("0x03", process.env.TOKEN_ACTIONS_MODULE_ADDRESS);
  console.log(`Transaction to set TokenActionsModule is ${tokenActionsModuleTx.hash}`);
  await tokenActionsModuleTx.wait();
}
