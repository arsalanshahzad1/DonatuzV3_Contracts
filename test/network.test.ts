import { deployments, ethers, getNamedAccounts } from "hardhat";
import { expect } from "chai";
import { ABI_WETH } from "../utils/wethAbi";
import { exportedHre } from "../hardhat.config"; // Import the exported hre
import { BaseContract, BigNumberish, MaxUint256, solidityPacked } from "ethers";
import { abi } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as abii } from "../artifacts/src/QuoterV2.sol/QuoterV2.json";
import { get_Sqrt_Ratio, getPoolSqrtAndTicks } from "../utils/getSqrtRatio";
import BigNumber from "bignumber.js";
import { Route } from "@uniswap/v3-sdk";

let hre: any;
let factoryContract: any;
let tokenM: any;
let tokenN: any;
let swapRouter: any;
let positionManager: any;
let deployerr: any;
let quoter: any;
let tokenIdNft:any;
async function main() {
  hre = await exportedHre; // Await the dynamic import
  console.log("Current Network:", hre.network.name);
  console.log("Provider URL:", hre.network.config.url);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

describe.only("Contract Interaction Test", function () {
  before(async () => {
    // Get the named accounts (from hardhat config)
    const { deployer: deployerAccount } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployerAccount);

    deployerr = deployerSigner;

    // Deploy the contracts using the fixtures (this will deploy the "Token" contract)
    await deployments.fixture([
      "UniswapV3Factory",
      "TokenM",
      "TokenN",
      "SwapRouter",
      "NonfungibleTokenPositionDescriptor",
      "NonfungiblePositionManager",
      "QuoterV2",
    ]); // Ensure "Token" contract is deployed

    // Retrieve the deployed contract instance using the deployer's account
    factoryContract = await ethers.getContract(
      "UniswapV3Factory",
      deployerAccount
    );
    console.log("before deploying tokens");
    tokenM = await ethers.getContract("TokenM", deployerr);
    tokenN = await ethers.getContract("TokenN", deployerr);
    swapRouter = await ethers.getContract("SwapRouter", deployerr);
    positionManager = await ethers.getContract(
      "NonfungiblePositionManager",
      deployerr
    );
    quoter = await ethers.getContract("QuoterV2", deployerr);

    const signers = await ethers.getSigners();
  });

  it("should read the public variable from the deployed contract", async function () {
    // Replace with the actual contract address on the forked network
    const contractAddress = "0x4200000000000000000000000000000000000006";

    // Create a contract instance
    const contract = new ethers.Contract(
      contractAddress,
      ABI_WETH,
      ethers.provider
    );
    const value = await contract.symbol();
    console.log("the symbol is ", value);
    expect(value).to.equal("WETH");
  });

  it("should read the owner of the contract ", async () => {
    const owner = await factoryContract.owner();
    console.log("the owner of the factory contract is ", owner);
  });

  // it("should impersonate the whale to create a pool", async () => {
  //   const donatuz_dnt = "0x00060EBE6F28EC0101156570D81cAC22b7E67A2A";
  // });

  it("should read the tokenM symbol of N & M", async () => {
    const symbol = await tokenM.symbol();
    console.log(`the symbol of tokenM is ${symbol}`);
    const symbol2 = await tokenN.symbol();
    console.log(`the symbol of tokenN is ${symbol2}`);
  });

  it("should approve the factory contract to use the tokenN and tokenM", async () => {
    const factoryDeployment = await deployments.get("UniswapV3Factory");
    const managerDeployment = await deployments.get(
      "NonfungiblePositionManager"
    );
    const positionAddress = managerDeployment.address;
    const factoryAddress = factoryDeployment.address;
    console.log(`the address of factory is the ${factoryAddress}`);
    console.log(`the positonManager address is A ${positionAddress}`);
    const approvalAmount = ethers.parseUnits("1000", 18); // Example: approve 1000 tokens

    const approveTokenM = await tokenM.approve(positionAddress, approvalAmount);
    await approveTokenM.wait();
    console.log("Factory approved for TokenM");

    const approveTokenN = await tokenN.approve(positionAddress, approvalAmount);
    await approveTokenN.wait();
    console.log("Factory approved for TokenN");
  });

  // it("should try to create a pool of tokenM and tokenN and read pool",async()=>{
  //   const NDeployment = await deployments.get("TokenN");
  //   const MDeployment = await deployments.get("TokenM");

  //   console.log(`the address of M IS ${NDeployment.address} AND THE N IS ${MDeployment.address}`)

  //   const pool = await factoryContract.createPool(NDeployment.address,MDeployment.address,500);
  //   const poolAddress = await factoryContract.getPool(NDeployment.address,MDeployment.address,500);

  //   const poolContract = new ethers.Contract(poolAddress, abi, ethers.provider);

  //   const slot0 = await poolContract.slot0();

  //   console.log(`Current sqrtPriceX96: ${slot0[0]}`);
  //   console.log(`Current tick: ${slot0[1]}`);

  //   const liquidity = await poolContract.liquidity();
  //   const fee = await poolContract.fee();

  //   console.log(`Current liquidity: ${liquidity}`);
  //   console.log(`Pool fee: ${fee}`);
  //   console.log(`the address of the pool that has been created is ${poolAddress}`)

  //   //below we will try to mint Position for the pool
  //   const yourToken_amount = 1000; // Token0 amount with 0 decimals

  //   const WETH_amount = 1000; // Token1 amount with 0 decimals
  //   const SqrtPriceX96 = BigInt(Math.sqrt(WETH_amount / yourToken_amount) * 2 ** 96);
  //   console.log(`the sqrt price for the token is in first pool creation is ${SqrtPriceX96}`)
  // })

  it("should create pool with the if necessary function and mint Position", async () => {
    //   const factoryDeployment = await deployments.get("UniswapV3Factory");
    const managerDeployment = await deployments.get(
      "NonfungiblePositionManager"
    );
    const quoterDeployment = await deployments.get("QuoterV2");

    const NDeployment = await deployments.get("TokenN");
    const MDeployment = await deployments.get("TokenM");
    const swapRouterAddress = await deployments.get("SwapRouter");
    const sqrt = await get_Sqrt_Ratio(10);

    console.log("the sqrttt ratio is ", sqrt);

    console.log("the sqrt ratio is ", sqrt);
    const positionAddress = managerDeployment.address;
    //   const factoryAddress =  factoryDeployment.address;
    //   console.log(`the address of factory is the ${factoryAddress}`)
    //   console.log(`the positonManager address is A ${positionAddress}`)
    //   const approvalAmount = ethers.parseUnits("1000", 18); // Example: approve 1000 tokens
    console.log("before initializing the pool etc ");
    const { sqrtPriceX96, adjustedTickLower, adjustedTickUpper } =
      getPoolSqrtAndTicks(0.9, 5, 18, 18, 10);
    const [token0, token1] = [NDeployment.address, MDeployment.address].sort();

    const pool = await positionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
      500,
      sqrtPriceX96.toString()
    );
    console.log(
      `the pool has been created with`
    );
    // console.log(`after creating a pool it has returned address of ${pool}`)
    const approvalAmount = ethers.parseUnits("100000", 18); // Example: approve 1000 tokens

    const approveTokenM = await tokenM.approve(positionAddress, approvalAmount);
    await approveTokenM.wait();
    console.log("Factory approved for TokenM");

    const approveTokenN = await tokenN.approve(positionAddress, approvalAmount);
    await approveTokenN.wait();
    const tickLowerr = -887220; // Lower tick (e.g., for a range of 0.5%)
    const tickUpperr = 887220; // Upper tick
    const amountA = ethers.parseUnits("100000", 18); // Amount of tokenA
    const amountB = ethers.parseUnits("990000", 18); // Amount of tokenB
    const amountAmin = ethers.parseUnits("900", 18); // Minimum amount of tokenA (slippage control)
    const amountBmin = ethers.parseUnits("900", 18); // Minimum amount of tokenB (slippage control)
    const userAddress = deployerr; // User's address (could be any Ethereum address)
    const deadline = Math.floor(Date.now() / 1000) + 60;
    const Nsymbol = await tokenN.symbol();
    const Msymbol = await tokenM.symbol();
    const poolAddress = await factoryContract.getPool(token0, token1, 500);
    console.log(
      `=========================== Checking POOL ADDRESS =========================== `
    );
    console.log(`the pool address is ${poolAddress}`);
    // const { lowerTick, upperTick } = await calculateTicks(20,poolAddress)
    // console.log(`the tick upper is ${upperTick} and lower is ${lowerTick}`);

    console.log(`the symbol of n & m are ${Nsymbol} & ${Msymbol}`);
    console.log(`before position mint try ====>>`);
    console.log(`the address of position manage is ${positionAddress}`);
    const {   tokenId,
       liquidity,
       amount0,
       amount1} = await positionManager.mint({
      token0: token0,
      token1: token1,
      fee: 500,
      tickLower: adjustedTickLower,
      tickUpper: adjustedTickUpper,
      amount0Desired: amountA,
      amount1Desired: amountB,
      amount0Min: amountAmin,
      amount1Min: amountBmin,
      recipient: userAddress,
      deadline: deadline,
    });
    console.log("Starting...");
// setTimeout(() => {
//   console.log("Waited 4 seconds");
//   // Add the next code to execute here
// }, 9000);
    
    tokenIdNft = tokenId;
    console.log(`== the nft id is of position is ${tokenIdNft}`)

   
    const approval = await tokenM.approve(
      swapRouterAddress.address,
      MaxUint256
    );
    const balance = await tokenM.balanceOf(deployerr);
    console.log(`===> balance of the deployer is ${balance}`);
    const allowance = await tokenM.allowance(
      deployerr,
      swapRouterAddress.address
    );
    console.log(
      ` ====== > the tokenM allowance for the approval for router is ${allowance} ...`
    );
    await approval.wait();
    const balanceBeforeN = await tokenM.balanceOf(deployerr);
    const balanceBeforem = await tokenN.balanceOf(deployerr);
    console.log(
      `balance before for n:${ethers.formatEther(
        balanceBeforeN
      )} and for m:${ethers.formatEther(balanceBeforem)}`
    );

    const path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [NDeployment.address, 500, MDeployment.address] // )
    );
    // const swapRouter = new ethers.Contract(
    //   swapRouterAddress.address,
    //   swapRouterAddress.abi,
    //   deployerr
    // );
    const amountOut = ethers.parseUnits("10", 18);
    const params = {
      path: path, // Fee tier (0.05% fee for the pool)
      recipient: deployerr, // Address that will receive the output token
      deadline: Math.floor(Date.now() / 1000) + 120, // Deadline (120 seconds from now)
      amountOut: 10, // Exact amount of output token you want (e.g., 10 DAI)
      amountInMaximum: 100, // Maximum amount of input token you're willing to spend (e.g., 100 WETH)
    };
    //@ts-ignore
    const swap = await swapRouter.exactOutput(params, { value: 0 });
    await swap.wait();
    const balanceBeforeN1 = await tokenM.balanceOf(deployerr);
    const balanceBeforem2 = await tokenN.balanceOf(deployerr);
    console.log(
      `balance after for n:${ethers.formatEther(
        balanceBeforeN1
      )} and for m:${ethers.formatEther(balanceBeforem2)}`
    );
    console.log(`the swap has been executed succesfully`);
  });

  it("should get the quotes for the swaps", async () => {
    const NDeployment = await deployments.get("TokenN");
    const MDeployment = await deployments.get("TokenM");
    const quoterDeployment = await deployments.get("QuoterV2");
    const quoterABI = [
      {
        inputs: [
          {
            internalType: "bytes",
            name: "path",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
        ],
        name: "quoteExactOutput",
        outputs: [
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint160[]",
            name: "sqrtPriceX96AfterList",
            type: "uint160[]",
          },
          {
            internalType: "uint32[]",
            name: "initializedTicksCrossedList",
            type: "uint32[]",
          },
          {
            internalType: "uint256",
            name: "gasEstimate",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const quoterAddress = quoterDeployment.address;
    console.log(`the quoter address is ${quoterAddress}`);
    const quoterr = new ethers.Contract(
      quoterAddress,
      quoterABI,
      ethers.provider
    );

    const nAddress = NDeployment.address;
    const mAddress = MDeployment.address;
    const fee = 500;
    const amountInn = ethers.parseUnits("10000", 18);
    const path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [nAddress, 500, mAddress] // WETH -> DAI with a fee of 500 (0.05%)
    );
    // const pathh = ethers.concat([
    //   "0xTOKEN_A_ADDRESS", // Input token
    //   ethers.hexlify(3000), // Fee (e.g., 0.3% = 3000)
    //   "0xTOKEN_B_ADDRESS"  // Output token
    // ]);
    console.log(`the encoded path is ${path}`);
    const weth = await quoter.WETH9();
    console.log(`the weth address in quoter is ${weth}`);
    const params = {
      tokenIn: nAddress,
      tokenOut: mAddress,
      amountIn: amountInn,
      fee: 500,
      sqrtPriceLimitX96: 0,
    };
    const amountOut = ethers.parseUnits("1.0", 18); // Replace with the desired amount and token decimals
    const getPool = await quoter.getPool(nAddress, mAddress, fee);
    console.log(`the pool address found is ${getPool}`);
    // const quote = await quoter.quoteExactOutput(path,amountIn);
    //@ts-ignore
    const quote = await quoterr.quoteExactOutput.staticCall(path, amountOut);
    console.log(`the over all quote returned is ${quote}`);
    const {
      amountIn,
      sqrtPriceX96AfterList,
      initializedTicksCrossedList,
      gasEstimate,
    } = quote;
    console.log(`the quote is ${amountIn}`);

    console.log(`the result of the quote is ${quote}`);
    //pool
    const poolContract = new ethers.Contract(getPool, abi, ethers.provider);

    const slot0 = await poolContract.slot0();
    const currentPrice = slot0[0]; // This returns the price as a scaled integer (1e18)
    const currentTick = slot0[1];

    console.log(`Current sqrtPriceX96: ${slot0[0]}`);
    console.log(`Current tick: ${slot0[1]}`);

    const liquidity = await poolContract.liquidity();
    const feee = await poolContract.fee();

    console.log(`Current liquidity: ${liquidity}`);
    console.log(`Pool fee: ${feee}`);
    console.log(`the address of the pool that has been created is ${getPool}`);
  });
  it("should test the exactInput and quoteExactInput", async () => {
    const NDeployment = await deployments.get("TokenN");
    const MDeployment = await deployments.get("TokenM");
    const SwapRouter = await deployments.get("SwapRouter");
    const path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [NDeployment.address, 500, MDeployment.address] // WETH -> DAI with a fee of 500 (0.05%)
    );
    const amountIn = ethers.parseUnits("0.7", 18);
    console.log(`the amountIn is ${amountIn}`);
    const {
      amountOut,
      sqrtPriceX96AfterList,
      initializedTicksCrossedList,
      gasEstimate,
    } = await quoter.quoteExactInput.staticCall(path, amountIn);
    //   struct ExactInputParams {
    //     bytes path;
    //     address recipient;
    //     uint256 deadline;
    //     uint256 amountIn;
    //     uint256 amountOutMinimum;
    // }
    console.log(`the quote for quoteExactInput is ${amountOut}`);
    const approve = await tokenN.approve(SwapRouter.address, amountIn);
    const params = {
      path: path,
      recipient: deployerr,
      deadline: Math.floor(Date.now() / 1000) + 120,
      amountIn: amountIn,
      amountOutMinimum: amountOut,
    };
    const swap = await swapRouter.exactInput(params);
    console.log(
      `the swap has been executed succesfully and the return amount is ${swap}`
    );
  });

  it("should test exactInputSingle and quote for quoteExactInputSingle", async () => {
    const NDeployment = await deployments.get("TokenN");
    const MDeployment = await deployments.get("TokenM");
    const SwapRouter = await deployments.get("SwapRouter");
    const deadline = Math.floor(Date.now() / 1000) + 120;
    const getPool = await quoter.getPool(
      NDeployment.address,
      MDeployment.address,
      500
    );
    const poolContract = new ethers.Contract(getPool, abi, ethers.provider);

    const slot0 = await poolContract.slot0();
    const currentPrice = slot0[0]; // This returns the price as a scaled integer (1e18)
    const currentTick = slot0[1];
    // const newSqrtPriceLimit = BigNumber(slot0[0].toString()).div(2 ** 28).toFixed(0);
    const newSqrtPriceLimit = BigNumber(slot0[0].toString())
      .times(1.1) // Allow for 10% price movement upward
      .toFixed(0);
    console.log(`the new sqrtPriceLimit is ${newSqrtPriceLimit}`);

    console.log(`Current sqrtPriceX96: ${slot0[0]}`);
    console.log(`Current tick: ${slot0[1]}`);
    const amountIn = ethers.parseUnits("50", 18);
    const quoteParams = {
      tokenIn: NDeployment.address,
      tokenOut: MDeployment.address,
      amountIn: amountIn,
      fee: 500,
      sqrtPriceLimitX96: newSqrtPriceLimit,
    };
    console.log(`calling the quoter`);
    const {
      amountOut,
      sqrtPriceX96After,
      initializedTicksCrossed,
      gasEstimate,
    } = await quoter.quoteExactInputSingle.staticCall(quoteParams);
    console.log(
      `the quote for exactInputSingle is ${amountOut} and new sqrtPrice is ${sqrtPriceX96After}`
    );
    const adjustedAmountOutMinimum = BigNumber(amountOut)
      .times(0.99) // Allow for up to 1% slippage
      .toFixed(0);

    const swapParams = {
      tokenIn: NDeployment.address,
      tokenOut: MDeployment.address,
      fee: 500,
      recipient: deployerr,
      deadline: deadline,
      amountIn: amountIn,
      amountOutMinimum: adjustedAmountOutMinimum,
      sqrtPriceLimitX96: newSqrtPriceLimit,
    };
    const approval = await tokenN.approve(SwapRouter.address, amountIn);
    const swap = await swapRouter.exactInputSingle(swapParams);
    console.log(`the swap has been executed succesfully`);

    //   struct QuoteExactInputSingleParams {
    //     address tokenIn;
    //     address tokenOut;
    //     uint256 amountIn;
    //     uint24 fee;
    //     uint160 sqrtPriceLimitX96;
    // }

    //   struct ExactInputSingleParams {
    //     address tokenIn;
    //     address tokenOut;
    //     uint24 fee;
    //     address recipient;
    //     uint256 deadline;
    //     uint256 amountIn;
    //     uint256 amountOutMinimum;
    //     uint160 sqrtPriceLimitX96;
    // }
  });

  it("should test the quoteExactOutPutSingle and exactOutputSingle", async () => {
    const quoterr = await deployments.get("QuoterV2");
    const token = await deployments.get("TokenN");
    const tokenM = await deployments.get("TokenM");
    const getPool = await quoter.getPool(token.address, tokenM.address, 500);
    const poolContract = new ethers.Contract(getPool, abi, ethers.provider);

    const slot0 = await poolContract.slot0();
    const currentPrice = slot0[0]; // This returns the price as a scaled integer (1e18)
    const currentTick = slot0[1];
    // const newSqrtPriceLimit = BigNumber(slot0[0].toString()).div(2 ** 28).toFixed(0);
    const newSqrtPriceLimit = BigNumber(slot0[0].toString())
      .times(1.1) // Allow for 10% price movement upward
      .toFixed(0);
    console.log(`the new sqrtPriceLimit is ${newSqrtPriceLimit}`);

    console.log(`Current sqrtPriceX96: ${slot0[0]}`);
    console.log(`Current tick: ${slot0[1]}`);

    const amountInn = ethers.parseUnits("50", 18);
    const quoteParams = {
      tokenIn: token.address,
      tokenOut: tokenM.address,
      amount: amountInn,
      fee: 500,
      sqrtPriceLimitX96: newSqrtPriceLimit,
    };
    const {
      amountIn,
      sqrtPriceX96After,
      initializedTicksCrossed,
      gasEstimate,
    } = await quoter.quoteExactOutputSingle.staticCall(quoteParams);
    console.log(`the quote returned from the quoter is ${amountIn}`);
    const swapRouterr = await deployments.get("SwapRouter");
    const approval = await tokenN.approve(swapRouterr.address, amountIn);
    console.log(`==== approved tokens ====`);
    const deadline = Math.floor(Date.now() / 1000) + 120;

    const swapParams = {
      tokenIn: token.address,
      tokenOut: tokenM.address,
      fee: 500,
      recipient: deployerr,
      deadline: deadline,
      amountOut: amountInn,
      amountInMaximum: amountIn,
      sqrtPriceLimitX96: sqrtPriceX96After,
    };
    const swap = await swapRouter.exactOutputSingle(swapParams);
    //   struct ExactOutputSingleParams {
    //     address tokenIn;
    //     address tokenOut;
    //     uint24 fee;
    //     address recipient;
    //     uint256 deadline;
    //     uint256 amountOut;
    //     uint256 amountInMaximum;
    //     uint160 sqrtPriceLimitX96;
    // }
  });

  it("should test the quoteExactOutput and and exactOutput", async () => {
    const nDeployment = await deployments.get("TokenN");
    const MDeployment = await deployments.get("TokenM");
    const routerContract = await deployments.get("SwapRouter");
    const path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [nDeployment.address, 500, MDeployment.address] // WETH -> DAI with a fee of 500 (0.05%)
    );
    const desiredAmountOut = ethers.parseUnits("10000", 18);
    const {
      amountIn,
      sqrtPriceX96AfterList,
      initializedTicksCrossedList,
      gasEstimate,
    } = await quoter.quoteExactOutput.staticCall(path, desiredAmountOut);
    console.log(`the quote recieved for the quoteExactOutput is ${amountIn}`);
    const approval = await tokenN.approve(routerContract.address, amountIn);
    //   struct ExactOutputParams {
    //     bytes path;
    //     address recipient;
    //     uint256 deadline;
    //     uint256 amountOut;
    //     uint256 amountInMaximum;
    // }
    const swapParams = {
      path: path,
      recipient: deployerr,
      deadline: Math.floor(Date.now() / 1000) + 120,
      amountOut: desiredAmountOut,
      amountInMaximum: amountIn,
    };
    const swap = await swapRouter.exactOutput(swapParams);
  });

  it("should increase the liquidty of pool",async()=>{
  //   struct IncreaseLiquidityParams {
  //     uint256 tokenId;
  //     uint256 amount0Desired;
  //     uint256 amount1Desired;
  //     uint256 amount0Min;
  //     uint256 amount1Min;
  //     uint256 deadline;
  // }
  const positionManagerr = await deployments.get("NonfungiblePositionManager")

    const amount0 = ethers.parseUnits("1000",18)
    const amount1 = amount0
    const increaseLiquidityParams = {
      tokenId : 1,
      amount0Desired:amount0,
      amount1Desired:amount1,
      amount0Min:0,
      amount1Min:0,
      deadline:Math.floor(Date.now() / 1000) + 120
    }
    const approven = await tokenN.approve(positionManagerr.address,amount0);
    const approvem = await tokenM.approve(positionManagerr.address,amount0);

    console.log(`== increasing the liquidity ==`)
    const increase = await positionManager.increaseLiquidity(increaseLiquidityParams,{value:0}) as unknown;
    console.log(`== after liquidity increase == `)


  })

  it("should collect reward of the position",async()=>{
  //   struct CollectParams {
  //     uint256 tokenId;
  //     address recipient;
  //     uint128 amount0Max;
  //     uint128 amount1Max;
  // }
  const balanceN = await tokenN.balanceOf(deployerr);
  const balanceM = await tokenN.balanceOf(deployerr);
  console.log(`the balance before collection is N: ${ethers.parseEther(balanceN.toString())} and M: ${ethers.parseEther(balanceM.toString())}`)

  const collectParams = {
    tokenId:1,
    recipient:deployerr,
    amount0Max:ethers.parseUnits("10",18),
    amount1Max:ethers.parseUnits("10",18)
  }

  const { amount0,  amount1} = await positionManager.collect(collectParams)
  // await collectCall.wait()
  console.log(`the rewards : ${amount0} & : ${amount1}`)

  const balanceNb = await tokenN.balanceOf(deployerr);
  const balanceMb = await tokenN.balanceOf(deployerr);
  console.log(`the balance before collection is N: ${ethers.parseEther(balanceNb.toString())} and M: ${ethers.parseEther(balanceMb.toString())}`)
  })
});
