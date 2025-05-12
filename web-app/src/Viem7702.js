import { createWalletClient, http, createPublicClient } from 'viem';
import { ethers } from 'ethers';
import { appConfig } from './types/config'

/**
 * Create and send an EIP-7702 transaction using MetaMask signing
 * 
 * @param {object} signer - Ethers.js signer from MetaMask
 * @param {object} provider - Ethers provider
 * @param {string} multicallAddress - Address of the multicall contract
 * @param {Array} calls - Array of call objects with target, value, and data
 * @param {bigint} ethValue - Total ETH value to send
 * @param {number} chainId - Chain ID for the network
 * @returns {Promise<string>} - Transaction hash
 */
export async function executeEIP7702Transaction(signer, multicallAddress, calls, ethValue, chainId) {
  try {
    // Get the signer's address
    const account = await signer.getAddress();
    console.log("Using account:", account);
    
    // Use a hardcoded RPC URL for the Hoodi network
    const rpcUrl = appConfig.network.rpcUrls[0] ;
    
    // Create viem clients
    const transport = http(rpcUrl);
    const chain = {
      id: chainId,
      name: 'Hoodi Network',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } }
    };

    const publicClient = createPublicClient({
      chain,
      transport
    });

    // Get current nonce from public client
    const nonce = await publicClient.getTransactionCount({
      address: account
    });

    // Generate EIP-7702 authorization message
    const authMessage = {
      chainId,
      address: multicallAddress,
      nonce: BigInt(nonce) + 1n
    };
    
    console.log("Debug authMessage values:");
    console.log("chainId:", authMessage.chainId);
    console.log("address:", authMessage.address);
    console.log("nonce:", authMessage.nonce.toString());

    // Create authorization signature using MetaMask
    const authMessageHash = ethers.solidityPackedKeccak256(
      ['uint256', 'address', 'uint256'],
      [authMessage.chainId, authMessage.address, authMessage.nonce]
    );

    // Sign the authorization with MetaMask
    const signature = await signer.signMessage(ethers.getBytes(authMessageHash));
    const { r, s, v } = ethers.Signature.from(signature);

    // Create authorization object
    const authorization = {
      ...authMessage,
      r,
      s,
      yParity: v - 27
    };
    
    console.log("Authorization object:", authorization);

    // Encode the function data for the multicall
    const multicallInterface = new ethers.Interface([
      "function aggregate(tuple(address target, uint256 value, bytes data)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
    ]);
    const encodedData = multicallInterface.encodeFunctionData("aggregate", [calls]);

    // Create and send the transaction
    const tx = await signer.sendTransaction({
      to: account,
      data: encodedData,
      value: ethValue,
      nonce: BigInt(nonce),
      gasLimit: 1000000n,
      maxFeePerGas: 10000000000n,
      maxPriorityFeePerGas: 1000000000n,
      authorizationList: [authorization]
    });
    
    console.log("Transaction object:", {
      to: account,
      value: ethValue.toString(),
      nonce: nonce,
      authorizationList: [authorization]
    });

    return tx.hash;
  } catch (error) {
    console.error("EIP-7702 transaction error:", error);
    throw error;
  }
}