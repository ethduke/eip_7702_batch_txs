// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev A simple ERC20 token that mints 1 billion tokens at deployment
 */
contract SimpleToken is ERC20, Ownable {
    // Token decimals (standard is 18)
    uint8 private constant _decimals = 18;
    
    // Initial supply: 1 billion tokens
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000 * (10 ** 18);

    /**
     * @dev Constructor that mints 1 billion tokens to the deployer
     */
    constructor() ERC20("Simple Token", "SMPL") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Returns the number of decimals used for token
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Allows the owner to mint additional tokens if needed
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
