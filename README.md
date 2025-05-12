# EIP-7702 Batch Transactions Demo

This repository demonstrates the implementation of [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) batch transactions in several formats:

1. **Smart Contract Implementation** - Foundry-based smart contract implementation
2. **Web Application** - React-based web application for interacting with batch transactions
3. **Python Implementation** - Python script for executing batch transactions

## Project Structure

- `/eip_7702_batch_txs` - Foundry smart contract implementation
- `/web-app` - React web application
- `/main.py` - Python implementation
- `/abi` - ABI files for contract interactions

## Getting Started

### Smart Contract Development

```bash
cd eip_7702_batch_txs
forge install
forge build
forge test
```

### Web Application

```bash
cd web-app
npm install
npm run dev
```

[How it looks](https://ipfs.io/ipfs/QmUzWrDaowBxtreqpU39EhZrA6nmKTdm6Pfybht6d2KHFv?filename=example.png)

### Python Implementation

```bash
# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your private keys and configuration
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "HOODI_RPC_URL=your_rpc_url_here" >> .env

# Run the script
python main.py
```

## Configuration

The application is configured through `config.json`. See `config_loader.py` for implementation details.

## Security Warning

**NEVER commit your private keys or sensitive information to GitHub!**

This project uses environment variables to manage sensitive information. Make sure to create a `.env` file locally and add it to `.gitignore`.

## License

MIT 
