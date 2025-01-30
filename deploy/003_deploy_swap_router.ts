import { HardhatRuntimeEnvironment } from "hardhat/types";
import {ethers} from 'hardhat'
import { DeployFunction } from "hardhat-deploy/types";
import {contracts} from '../utils/contract_address'


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    //@ts-ignore
  const { deployments, getNamedAccounts } = hre;
//   https://42019.rpc.thirdweb.com/${THIRDWEB_API_KEY}
  const { deploy } = deployments;

  // Get the deployer and tokenOwner accounts
  let factoryAddress;
  for (const contract of contracts) {
    if (contract.name === "UniswapV3Factory") {
      factoryAddress = contract.address;
      break; // Exit the loop once found
    }
  }
  
  if (!factoryAddress) {
    throw new Error("UniswapV3Factory contract not found in the contracts array.");
  }
  const { deployer, tokenOwner } = await getNamedAccounts();
  console.log(`the deployer is a ${deployer}`)
  
  const weth = process.env.WETH_ADDRESS;
  // console.log("the factory deplyed is at address",factoryAddress);
 
  // Deploy the Lock contract
  await deploy("SwapRouter", {
    from: deployer,
    args: [factoryAddress,weth], // Pass the calculated unlockTime
    log: true,
    gasLimit: 30000000 // Set an appropriate gas limit

  });
};

export default func;

func.tags = ["SwapRouter"];


