# EIP-7702 Transaction Tester

A simple web application to test EIP-7702 transactions using MetaMask.

## Features

- MetaMask integration
- Network validation
- Transaction status updates
- Modern UI with Chakra UI
- Vercel deployment support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
VITE_HOODI_RPC_URL=your_rpc_url_here
VITE_MULTICALL_ADDRESS=0xf31E456241fe3CE5180Dc47055B8C5d72eCe222A
VITE_HOODI_CHAIN_ID=560048
```

3. Run the development server:
```bash
npm run dev
```

## Deployment

This application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Technologies Used

- React
- Vite
- Chakra UI
- Web3.js
- Ethers.js
- MetaMask
