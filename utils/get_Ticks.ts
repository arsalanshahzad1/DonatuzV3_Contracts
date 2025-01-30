import BigNumber from "bignumber.js";
// Constants
// const Q96 = BigNumber.from(2).pow(96); // 2^96 for sqrtPriceX96 calculations
const Q96 = new BigNumber(2).pow(96); // 2^96 for sqrtPriceX96 calculations


/**
 * Calculate sqrtPriceX96 based on token price and decimals
 * @param price - Price of token0 in terms of token1
 * @param decimalsToken0 - Decimals of token0
 * @param decimalsToken1 - Decimals of token1
 * @returns sqrtPriceX96 as BigNumber
 */
function calculateSqrtPriceX96(
  price: number,
  decimalsToken0: number,
  decimalsToken1: number
): BigNumber {
  // Adjust price based on token decimals
  const adjustedPrice = price / Math.pow(10, decimalsToken1 - decimalsToken0);

  // Compute sqrtPrice
  const sqrtPrice = Math.sqrt(adjustedPrice);

  // Convert to sqrtPriceX96
  // return BigNumber.from(Math.floor(sqrtPrice * Q96.toNumber()));
  return new BigNumber(sqrtPrice).multipliedBy(Q96).integerValue(BigNumber.ROUND_FLOOR);

}

/**
 * Calculate tick index based on price and decimals
 * @param price - Price of token0 in terms of token1
 * @param decimalsToken0 - Decimals of token0
 * @param decimalsToken1 - Decimals of token1
 * @returns Tick index as a number
 */
function calculateTickFromPrice(
  price: number,
  decimalsToken0: number,
  decimalsToken1: number
): number {
  // Adjust price for token decimals
  const adjustedPrice = price / Math.pow(10, decimalsToken1 - decimalsToken0);

  // Calculate tick using the formula log1.0001(adjustedPrice)
  const logBase = Math.log(1.0001); // Log base for tick calculation
  return Math.floor(Math.log(adjustedPrice) / logBase);
}

/**
 * Align tick to pool's tick spacing
 * @param tick - Original tick value
 * @param tickSpacing - Tick spacing for the pool
 * @returns Aligned tick value as a multiple of tickSpacing
 */
function alignTickToSpacing(tick: number, tickSpacing: number): number {
  return Math.floor(tick / tickSpacing) * tickSpacing;
}

// Main script logic for UI integration
export function calculatePoolParams(
  price: number,
  priceLower: number,
  priceUpper: number,
  decimalsToken0: number,
  decimalsToken1: number,
  tickSpacing: number
): {
  sqrtPriceX96: BigNumber;
  tickLower: number;
  tickUpper: number;
} {
  // Step 1: Calculate sqrtPriceX96 for pool initialization
  const sqrtPriceX96 = calculateSqrtPriceX96(price, decimalsToken0, decimalsToken1);

  // Step 2: Calculate tickLower and tickUpper
  let tickLower = calculateTickFromPrice(priceLower, decimalsToken0, decimalsToken1);
  let tickUpper = calculateTickFromPrice(priceUpper, decimalsToken0, decimalsToken1);

  // Align ticks to tick spacing
  tickLower = alignTickToSpacing(tickLower, tickSpacing);
  tickUpper = alignTickToSpacing(tickUpper, tickSpacing);

  // Step 3: Return calculated values
  return {
    sqrtPriceX96,
    tickLower,
    tickUpper,
  };
}

// Example usage
function main() {
  // Example input values (can be replaced with UI-provided values)
  const price = 10; // Initial price: 1 ETH = 2000 USDC
  const priceLower = 5; // Lower price bound
  const priceUpper = 15; // Upper price bound
  const decimalsToken0 = 18; // WETH decimals
  const decimalsToken1 = 18; // USDC decimals
  const tickSpacing = 10; // 0.5% fee tier

  // Calculate pool parameters
  const { sqrtPriceX96, tickLower, tickUpper } = calculatePoolParams(
    price,
    priceLower,
    priceUpper,
    decimalsToken0,
    decimalsToken1,
    tickSpacing
  );

  console.log("sqrtPriceX96:", sqrtPriceX96.toFixed(0));
  console.log("tickLower:", -tickLower);
  console.log("tickUpper:", tickUpper);
}

main();
