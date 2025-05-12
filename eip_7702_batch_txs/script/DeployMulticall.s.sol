// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Multicall} from "../src/Multicall.sol";

contract DeployMulticall is Script {
    function run() external {
        // Retrieve deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Log deployment network info
        console.log("Deploying to Hoodi Testnet...");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the Multicall contract
        Multicall multicall = new Multicall();
        
        // Log the deployed contract address
        console.log("Multicall deployed at:", address(multicall));
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}

