import {ethers,keccak256} from 'ethers'
import {bytecode} from '../artifacts/src/UniswapV3Pool.sol/UniswapV3Pool.json'
const poolBytecode = bytecode; 
const poolInitCodeHash = keccak256(poolBytecode);
console.log('POOL_INIT_CODE_HASH:', poolInitCodeHash)