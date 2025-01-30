import { HardhatRuntimeEnvironment } from "hardhat/types";
import {ethers} from 'hardhat'
import { DeployFunction } from "hardhat-deploy/types";
import {contracts} from '../utils/contract_address'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    //@ts-ignore
  const { deployments, getNamedAccounts } = hre;
//   https://42019.rpc.thirdweb.com/${THIRDWEB_API_KEY}
  const { deploy } = deployments;
  const weth = process.env.WETH_ADDRESS;
  // Get the deployer and tokenOwner accounts
  const { deployer, tokenOwner } = await getNamedAccounts();
  console.log(`the deployer is a ${deployer}`)
  
  let factoryAddress;
  for (const contract of contracts) {
    if (contract.name === "UniswapV3Factory") {
      factoryAddress = contract.address;
      break; // Exit the loop once found
    }
  }
  // Deploy the Lock contract
  const deployAddress = await deploy("QuoterV2", {
    from: deployer,
    args: [factoryAddress,weth], // Pass the calculated unlockTime
    log: true,
    gasLimit: 30000000 // Set an appropriate gas limit

  });
  console.log("the factory deployed at",deployAddress.address);
  contracts.push({name:"QuoterV2",address:deployAddress.address,})
};

export default func;

func.tags = ["QuoterV2"];
