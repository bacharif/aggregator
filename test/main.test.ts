import { expect } from 'chai';
import { Wallet, Provider, Contract } from 'zksync-web3';
import * as hre from 'hardhat';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import * as ethers from "ethers";

// load contract artifact. Make sure to compile first!
import * as ContractArtifact from "../artifacts-zk/contracts/Liquidity.sol/Liquidity.json";
import * as ERC20ContractArtifact from "../artifacts-zk/contracts/libraries/ERC20.sol/ERC20.json";

const RICH_WALLET_PK =
  '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3';

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
  this.timeout(100000); 
  it("Should perform swap and bridge successfully", async function () {
    const provider = Provider.getDefaultProvider();

    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    
    const logger = await deployLogger(deployer);
    const dexModule = await deployDexModule(deployer, logger);
    const tokenActionsModule = await deployTokenActionsModule(deployer, logger);
    const gravityModule = await deployGravityModule(deployer, logger);

    const liquidity = await deployLiquidity(deployer, wallet.address);
    console.log("Liquidity contract address: ", liquidity.address);
    // Set the modules
    await liquidity.setModule("0x01",dexModule.address);
    console.log("Dex module address: ", dexModule.address);
    await liquidity.setModule("0x02",gravityModule.address);
    console.log("Gravity module address: ", gravityModule.address);
    await liquidity.setModule("0x03",tokenActionsModule.address);
    console.log("Token actions module address: ", tokenActionsModule.address);

    // Use the provided Liquidity contract address
    /* const liquidity = new ethers.Contract(
       '0xFB32281c1EEaAD4F9D2A4c24779189637bADbAc9',
       ContractArtifact.abi,
       wallet
     );*/

    const dexModuleAddress = await liquidity.getModule("0x01");
    console.log("Get Dex Module: ", dexModuleAddress);
    const gravityModuleAddress = await liquidity.getModule("0x02");
    console.log("Get Gravity Module: ", gravityModuleAddress);
    const tokenActionsModuleAddress = await liquidity.getModule("0x03");
    console.log("Get Token Actions Module: ", tokenActionsModuleAddress);

    console.log("Add Modules done")
    const DAI_ADDRESS = "0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b";
    const LINK_ADDRESS = "0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78";
    const KYBERSWAP_ROUTER = "0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6";
    const BRIDGE_ADDRESS = "0xa4108aA1Ec4967F8b52220a4f7e94A8201F2D906";

    const _amountIn =  ethers.utils.parseUnits("200", 6);
    const _amountOut = ethers.utils.parseUnits("30");
    const _minConversionRate = ethers.utils.parseEther("0");

    let ABI= ["function approveToken(address,address,uint256)"];
    let iface = new ethers.utils.Interface(ABI);
    let data = iface.encodeFunctionData("approveToken", [DAI_ADDRESS, liquidity.address, _amountIn]);

    const approveForSwapData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "bytes"],
      [0x03, data]
    );

    ABI= ["function exchange(address,address,address,uint256,bytes)"];
    iface = new ethers.utils.Interface(ABI);
    data = iface.encodeFunctionData("exchange", [KYBERSWAP_ROUTER, DAI_ADDRESS, LINK_ADDRESS, _amountIn, _minConversionRate]);

    const dexModuleData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "bytes"],
      [0x01, data]
    );

    ABI= ["function approveToken(address,address,uint256)"];
    iface = new ethers.utils.Interface(ABI);
    data = iface.encodeFunctionData("approveToken", [LINK_ADDRESS, BRIDGE_ADDRESS, _amountOut]);

    const approveForBridgeData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "bytes"],
      [0x03, data]
    );

    ABI= ["function sendToCosmos(address,string,uint256)"];
    iface = new ethers.utils.Interface(ABI);
    data = iface.encodeFunctionData("sendToCosmos", [LINK_ADDRESS, wallet.address, _amountOut]);

    const gravityModuleData = ethers.utils.defaultAbiCoder.encode(
      ["bytes1", "bytes"],
      [0x02, data]
    );

    console.log("Multicall data: ", approveForSwapData, dexModuleData, approveForBridgeData, gravityModuleData);
    const tx = await liquidity.multicall([approveForSwapData, dexModuleData, approveForBridgeData, gravityModuleData]);
    console.log("Transaction hash: ", tx.hash);
    await tx.wait();

    /*
    const usdcContract = new ethers.Contract(
      '0x294cB514815CAEd9557e6bAA2947d6Cf0733f014',
      ERC20ContractArtifact.abi,
      wallet
    );*/

    //const balance = await usdcContract.balanceOf(wallet.address);
    //expect(balance.lt(_amountIn)).to.be.true;
  });
});
