import { encodeSqrtRatioX96, TickMath } from "@uniswap/v3-sdk";
import { BigNumberish, ethers, toBigInt } from "ethers";

export const get_Sqrt_Ratio = async (tick_Spacing: number) => {
  const sqrt = TickMath.getSqrtRatioAtTick(tick_Spacing);
  const sqrtRatioX96: BigNumberish = sqrt.toString();
  return sqrtRatioX96;
};

export const getPoolSqrtAndTicks = (
  amount0: number,
  amount1: number,
  decimals0: number,
  decimals1: number,
  tickSpacing:number
) => {
  const scaled0 = ethers.parseUnits(amount0.toString(), decimals0);
  const scaled1 = ethers.parseUnits(amount1.toString(), decimals1);
  const sqrtPriceX96 = encodeSqrtRatioX96(scaled0.toString(),scaled1.toString())

  //
//   const lowerAmount0 = amount0 * 0.95; // 10% decrease
//   const lowerAmount1 = amount1 * 0.95;

//   const higherAmount0 = amount0 * 1.05; // 10% increase
//   const higherAmount1 = amount1 * 1.05;
const lowerAmount0 = amount0 * 0.95; // Decrease amount0 by 5%
  const lowerAmount1 = amount1 * 1.05; // Increase amount1 by 5%

  // Adjust amounts for a higher price range (10% increase in price)
  const higherAmount0 = amount0 * 1.10; // Increase amount0 by 10%
  const higherAmount1 = amount1 * 0.90
  const scaledLower0 = ethers.parseUnits(lowerAmount0.toString(), decimals0);
  const scaledLower1 = ethers.parseUnits(lowerAmount1.toString(), decimals1);

  const scaledHigher0 = ethers.parseUnits(higherAmount0.toString(), decimals0);
  const scaledHigher1 = ethers.parseUnits(higherAmount1.toString(), decimals1);

  // Calculate sqrtPriceX96 for lower and higher ranges
  const sqrtPriceLowerX96 = encodeSqrtRatioX96(scaledLower0.toString(), scaledLower1.toString());
  const sqrtPriceHigherX96 = encodeSqrtRatioX96(scaledHigher0.toString(), scaledHigher1.toString());
 
  // Convert sqrt prices to ticks
  const tickLower = TickMath.getTickAtSqrtRatio(sqrtPriceLowerX96);
  const tickUpper = Math.abs(TickMath.getTickAtSqrtRatio(sqrtPriceHigherX96));
  // const tickSpacing = 10; // Example for 0.05% fee tier
  const adjustedTickLower = Math.floor(tickLower / tickSpacing) * tickSpacing;
  const adjustedTickUpper = Math.ceil(tickUpper / tickSpacing) * tickSpacing;

  // Log results
  console.log(`Initial sqrtPriceX96: ${sqrtPriceX96}`);
  console.log(`Lower sqrtPriceX96: ${sqrtPriceLowerX96}, TickLower: ${tickLower}`);
  console.log(`Higher sqrtPriceX96: ${sqrtPriceHigherX96}, TickUpper: ${tickUpper}`)
  console.log(`Initial adjustedTickLower: ${adjustedTickLower}`);
  console.log(`Initial adjustedTickUpper: ${adjustedTickUpper}`);


  //
 
  console.log(`the sqrt Ratio iss ${sqrtPriceX96}`);
  return {sqrtPriceX96,adjustedTickLower,adjustedTickUpper};
  
};

// getPoolSqrtAndTicks(9,19,18,18);
