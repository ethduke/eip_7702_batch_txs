from web3 import Web3
from eth_account import Account
import os
import json
from dotenv import load_dotenv
from config_loader import config

# Load environment variables
load_dotenv()

RPC_URL = os.getenv("HOODI_RPC_URL", config.network.rpcUrls[0])
w3 = Web3(Web3.HTTPProvider(RPC_URL))

HOODI_CHAIN_ID = config.network.chainId
MULTICALL_ADDRESS = config.contracts.multicall
# Multicall Contract ABI (simplified for this example)
MULTICALL_ABI = json.loads(open("abi/multicall.json").read())

SMPL_TOKEN_ADDRESS = config.contracts.token
SMPL_TOKEN_ABI = json.loads(open("abi/smpl_token.json").read())

# Function to encode multicall data
def encode_multicall_data():
    # Create contract instance for the multicall
    multicall_contract = w3.eth.contract(address=MULTICALL_ADDRESS, abi=MULTICALL_ABI)
    
    # Token contract we want to interact with
    token_contract = w3.eth.contract(address=SMPL_TOKEN_ADDRESS, abi=SMPL_TOKEN_ABI)
    
    # Create multicall calls
    calls = [
        # Call 1: Token transfer
        {
            "target": SMPL_TOKEN_ADDRESS,
            "value": 0,
            "data": token_contract.encode_abi("transfer", args=[config.recipients.recipient1, w3.to_wei(float(config.transactions.tokenTransferAmount), 'ether')])
        },
        # Call 2: ETH transfer
        {
            "target": config.recipients.recipient1,
            "value": w3.to_wei(float(config.transactions.ethTransfer1Amount), 'ether'),
            "data": "0x"  
        },
        # Call 3: ETH transfer
        {
            "target": config.recipients.recipient2,
            "value": w3.to_wei(float(config.transactions.ethTransfer2Amount), 'ether'),
            "data": "0x"  
        }
    ]
    
    # Encode the multicall data
    return multicall_contract.encode_abi("aggregate", args=[calls])

# Main execution
def main():

    # Load EOA account from private key
    acct = Account.from_key(os.getenv("PRIVATE_KEY"))
    print(f"Account address: {acct.address}")
    nonce = w3.eth.get_transaction_count(acct.address)
    print(f"Current nonce: {nonce}")
    
    # Build an authorization utilizing the multicall contract
    auth = {
        "chainId": HOODI_CHAIN_ID,
        "address": MULTICALL_ADDRESS,
        "nonce": nonce + 1,
    }
    
    # Sign the auth with the EOA
    signed_auth = acct.sign_authorization(auth)
    print("Authorization signed successfully")
    
    # Build the type 4 transaction
    tx = {
        "chainId": HOODI_CHAIN_ID,
        "nonce": nonce,
        "gas": 1_000_000,
        "maxFeePerGas": 10**10,
        "maxPriorityFeePerGas": 10**9,
        "to": acct.address,
        "authorizationList": [signed_auth],
        "data": encode_multicall_data(),
    }
    print("Type 4 transaction built successfully")
    
    try:
        signed_tx = acct.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"Transaction sent with hash: {tx_hash.hex()}")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Transaction confirmed in block {receipt['blockNumber']}")
        print(f"Gas used: {receipt['gasUsed']}")
    except Exception as e:
        print(f"Error sending transaction: {e}")

if __name__ == "__main__":
    main()
