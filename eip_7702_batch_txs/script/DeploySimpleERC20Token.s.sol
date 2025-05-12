// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/SimpleERC20Token.sol";

contract DeploySimpleERC20Token is Script {
    function run() external {
        // Retrieve deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Log deployment information
        console.log("Deploying SimpleToken to Hoodi Testnet...");
        console.log("Initial supply: 1,000,000,000 SMPL");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the SimpleToken contract
        SimpleToken token = new SimpleToken();
        
        // Log the deployed contract address
        console.log("SimpleToken deployed at:", address(token));
        console.log("Token symbol:", token.symbol());
        console.log("Token name:", token.name());
        console.log("Total supply:", token.totalSupply() / (10 ** token.decimals()));

        uint256 initialBalance = token.balanceOf(deployer);
        console.log("Initial deployer balance:", initialBalance / (10 ** token.decimals()), "SMPL");
        
        // Mint additional 100,000 tokens to the deployer
        uint256 mintAmount = 100_000 * (10 ** token.decimals());
        token.mint(deployer, mintAmount);
        
        // Check updated balance of deployer
        uint256 finalBalance = token.balanceOf(deployer);
        console.log("Final deployer balance:", finalBalance / (10 ** token.decimals()), "SMPL");
        
        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}
