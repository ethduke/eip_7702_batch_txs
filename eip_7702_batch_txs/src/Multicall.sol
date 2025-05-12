// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

/**
 * @title Multicall
 * @dev Contract to batch multiple calls in a single transaction
 * Compatible with EIP-7702 Type 4 transactions
 */
contract Multicall {
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }
    
    // Event to log calls
    event CallExecuted(address indexed target, uint256 value, bytes data, bool success);
    
    /**
     * @dev Function to aggregate multiple calls
     * @param calls Array of Call structs
     * @return blockNumber Current block number
     * @return returnData Array of return data from each call
     */
    function aggregate(Call[] memory calls) external payable returns (uint256 blockNumber, bytes[] memory returnData) {
        returnData = new bytes[](calls.length);
        
        for(uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory ret) = calls[i].target.call{value: calls[i].value}(calls[i].data);
            require(success, "Multicall: call failed");
            returnData[i] = ret;
            emit CallExecuted(calls[i].target, calls[i].value, calls[i].data, success);
        }
        
        return (block.number, returnData);
    }
    
    /**
     * @dev Function to try aggregate multiple calls (without reverting on failure)
     * @param requireSuccess Whether to require all calls to succeed
     * @param calls Array of Call structs
     * @return blockNumber Current block number
     * @return returnData Array of return data from each call
     * @return success Array of success status for each call
     */
    function tryAggregate(bool requireSuccess, Call[] memory calls) 
        external 
        payable 
        returns (uint256 blockNumber, bytes[] memory returnData, bool[] memory success) 
    {
        returnData = new bytes[](calls.length);
        success = new bool[](calls.length);
        
        for(uint256 i = 0; i < calls.length; i++) {
            (success[i], returnData[i]) = calls[i].target.call{value: calls[i].value}(calls[i].data);
            
            if(requireSuccess) {
                require(success[i], "Multicall: call failed");
            }
            
            emit CallExecuted(calls[i].target, calls[i].value, calls[i].data, success[i]);
        }
        
        return (block.number, returnData, success);
    }
    
    // Function to receive ETH
    receive() external payable {}
}