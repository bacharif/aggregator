import { expect } from 'chai';
import { Wallet, Provider, Contract } from 'zksync-web3';
import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as ethers from "ethers";

// load contract artifact. Make sure to compile first!
import * as ContractArtifact from "../artifacts-zk/contracts/Liquidity.sol/Liquidity.json";

const RICH_WALLET_PK =
  '';

  async function deployLogger(deployer: Deployer): Promise<Contract> {
    const artifact = await deployer.loadArtifact('Logger');
    return await deployer.deploy(artifact, []);
  }

  async function deployLiquidity(deployer: Deployer, constructorArg: string): Promise<Contract> {
    const artifact = await deployer.loadArtifact('Liquidity');
    return await deployer.deploy(artifact, [constructorArg]);
  }

  async function deployDexModule(deployer: Deployer, logger: Contract): Promise<Contract> {
    const artifact = await deployer.loadArtifact('DexModule');
    return await deployer.deploy(artifact, [logger.address]);
  }
  
  async function deployTokenActionsModule(deployer: Deployer, logger: Contract): Promise<Contract> {
    const artifact = await deployer.loadArtifact('TokenActionsModule');
    return await deployer.deploy(artifact, [logger.address]);
  }
  
  async function deployGravityModule(deployer: Deployer, logger: Contract): Promise<Contract> {
    const artifact = await deployer.loadArtifact('GravityModule');
    return await deployer.deploy(artifact, [logger.address]);
  }
  
  
describe('Liquidity', function () {
  it("Should perform swap and bridge successfully", async function () {
    const provider = Provider.getDefaultProvider();

    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    // const logger = await deployLogger(deployer);
    // const dexModule = await deployDexModule(deployer, logger);
    // const tokenActionsModule = await deployTokenActionsModule(deployer, logger);
    // const gravityModule = await deployGravityModule(deployer, logger);

    // const liquidity = await deployLiquidity(deployer, wallet.address);
    // console.log("Liquidity contract address: ", liquidity.address);
    // // Set the modules
    // await liquidity.setModule("0x01",dexModule.address);
    // await liquidity.setModule("0x02",gravityModule.address);
    // await liquidity.setModule("0x03",tokenActionsModule.address);

    // Use the provided Liquidity contract address
    const liquidity = new ethers.Contract(
      '0xFB32281c1EEaAD4F9D2A4c24779189637bADbAc9',
      ContractArtifact.abi,
      wallet
    );


    console.log("Add Modules done")
    const USDC_ADDRESS = "0x294cB514815CAEd9557e6bAA2947d6Cf0733f014";
    const LINK_ADDRESS = "0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78";

    // Convert 0.0012 ETH to wei
    const _amountIn =  ethers.utils.parseUnits("200", 6);
    // Convert 2 USDT to smallest unit
    const _amountOut = ethers.utils.parseUnits("30");
    const _minConversionRate = ethers.utils.parseEther("0.1");

    const approveForSwapData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "address", "address", "uint256"],
      [0x03, USDC_ADDRESS, liquidity.address, _amountIn]
    );

    const dexModuleData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "address", "address", "uint256", "bytes"],
      [0x01, USDC_ADDRESS, LINK_ADDRESS, _amountIn, _minConversionRate]
    );

    const approveForBridgeData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "address", "address", "uint256"],
      [0x03, LINK_ADDRESS, liquidity.address, _amountOut]
    );

    const gravityModuleData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "address", "string", "uint256"],
      [0x02, LINK_ADDRESS, wallet.address, _amountOut]
    );
    console.log("Multicall data: ", approveForSwapData, dexModuleData, approveForBridgeData, gravityModuleData);
    const tx = await liquidity.multicall([approveForSwapData, dexModuleData, approveForBridgeData, gravityModuleData]);
    await tx.wait();

    // Add your assertions here based on the expected outcome of the transaction
    // For example, if you expect the balance of USDT to increase in the wallet, you can check that
    // const balance = await usdtContract.balanceOf(wallet.address);
    // expect(balance).to.be.gt(_amountOut);
  });
});
