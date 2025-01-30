import { HardhatRuntimeEnvironment } from "hardhat/types";
import {ethers} from 'hardhat'
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    //@ts-ignore
  const { deployments, getNamedAccounts } = hre;
//   https://42019.rpc.thirdweb.com/${THIRDWEB_API_KEY}
  const { deploy } = deployments;

  // Get the deployer and tokenOwner accounts
  const { deployer, tokenOwner } = await getNamedAccounts();
  console.log(`the deployer is a ${deployer}`)

  // Calculate the unlock time (current block timestamp + one year)
const name = "myToken";
const ticker = "MTK";
const nativeEtherToSend = ethers.parseEther("0.0001");


  // Deploy the Lock contract
  await deploy("Lock", {
    from: deployer,
    // args: [name,ticker,deployer], // Pass the calculated unlockTime
    log: true,
    gasLimit: 30000000 // Set an appropriate gas limit

  });
};

export default func;

func.tags = ["Lock"];
