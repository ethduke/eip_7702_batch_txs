import { useState } from 'react'
import { ChakraProvider, Box, VStack, Button, Text, useToast, Container, Heading, HStack } from '@chakra-ui/react'
import { ethers } from 'ethers'
import tokenAbi from '../../abi/smpl_token.json'
import { executeEIP7702Transaction } from './Viem7702'
import { appConfig } from './types/config'

// Network configuration from shared config
const HOODI_NETWORK = {
  chainId: appConfig.network.chainId,
  chainName: appConfig.network.chainName,
  nativeCurrency: appConfig.network.nativeCurrency,
  rpcUrls: appConfig.network.rpcUrls,
  blockExplorerUrls: appConfig.network.blockExplorerUrls
}

// Contract addresses from shared config
const MULTICALL_ADDRESS = appConfig.contracts.multicall
const TOKEN_ADDRESS = appConfig.contracts.token

// Recipient addresses from shared config
const RECIPIENT_1 = appConfig.recipients.recipient1
const RECIPIENT_2 = appConfig.recipients.recipient2

// Transaction amounts from shared config
const TOKEN_TRANSFER_AMOUNT = appConfig.transactions.tokenTransferAmount
const ETH_TRANSFER_1_AMOUNT = appConfig.transactions.ethTransfer1Amount
const ETH_TRANSFER_2_AMOUNT = appConfig.transactions.ethTransfer2Amount

function App() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentChainId, setCurrentChainId] = useState(null)
  const toast = useToast()

  // Network switching function
  const switchToHoodiNetwork = async () => {
    try {
      setLoading(true)
      setStatus('Adding Hoodi Network...')

      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            ...HOODI_NETWORK,
            chainId: ethers.toBeHex(HOODI_NETWORK.chainId)
          }],
        })
      } catch (addError) {
        console.log('Network might already be added')
      }

      setStatus('Switching to Hoodi Network...')
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(HOODI_NETWORK.chainId) }],
      })

      setStatus('Connected to Hoodi Network')
      setCurrentChainId(HOODI_NETWORK.chainId)
      
      toast({
        title: 'Network Switched',
        description: 'Successfully connected to Hoodi Network',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Network switch error:', error)
      setStatus('Error switching network: ' + error.message)
      toast({
        title: 'Error',
        description: 'Failed to switch network: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Main transaction handler
  const handleTransaction = async () => {
    try {
      setLoading(true)
      setStatus('Connecting to wallet...')

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this feature')
      }

      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const account = await signer.getAddress()
      setStatus('Connected to wallet: ' + account)

      // Check network
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      setCurrentChainId(chainId)
      
      if (chainId !== HOODI_NETWORK.chainId) {
        setStatus('Please switch to the Hoodi network')
        toast({
          title: 'Wrong Network',
          description: 'Please switch to the Hoodi network',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      // Setup token contract
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer)
      
      // Check token balance and allowance
      const tokenBalance = await tokenContract.balanceOf(account)
      const currentAllowance = await tokenContract.allowance(account, MULTICALL_ADDRESS)
      const transferAmount = ethers.parseEther(TOKEN_TRANSFER_AMOUNT)

      if (tokenBalance < transferAmount) {
        throw new Error(`Insufficient token balance. Have ${ethers.formatEther(tokenBalance)}, need ${ethers.formatEther(transferAmount)}`)
      }

      if (currentAllowance < transferAmount) {
        setStatus('Approving token transfer...')
        const approveTx = await tokenContract.approve(MULTICALL_ADDRESS, ethers.MaxUint256)
        await approveTx.wait()
      }

      // Create multicall calls
      const calls = [
        // Token transfer
        {
          target: TOKEN_ADDRESS,
          value: 0n,
          data: tokenContract.interface.encodeFunctionData("transfer", [
            RECIPIENT_1,
            ethers.parseEther(TOKEN_TRANSFER_AMOUNT)
          ])
        },
        // ETH transfer 1
        {
          target: RECIPIENT_1,
          value: ethers.parseEther(ETH_TRANSFER_1_AMOUNT),
          data: "0x"
        },
        // ETH transfer 2
        {
          target: RECIPIENT_2,
          value: ethers.parseEther(ETH_TRANSFER_2_AMOUNT),
          data: "0x"
        }
      ]

      // Calculate total ETH value
      const totalEthValue = calls.reduce((sum, call) => {
        return sum + (typeof call.value === 'bigint' ? call.value : BigInt(call.value.toString()))
      }, 0n)

      // Execute EIP-7702 transaction
      setStatus('Sending EIP-7702 transaction...')
      const txHash = await executeEIP7702Transaction(
        signer,
        MULTICALL_ADDRESS,
        calls,
        totalEthValue,
        HOODI_NETWORK.chainId
      )

      setStatus('Transaction sent! Waiting for confirmation...')
      const receipt = await provider.waitForTransaction(txHash)

      if (!receipt || receipt.status === 0) {
        throw new Error("Transaction failed")
      }

      setStatus('Transaction confirmed!')
      toast({
        title: 'Success',
        description: `Transaction completed successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Transaction failed:", error)
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.md">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" mb={4}>
                EIP-7702 Transaction Tester
              </Heading>
              <Text color="gray.600">
                Test your EIP-7702 transactions with a simple click
              </Text>
            </Box>

            <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
              <VStack spacing={6}>
                <HStack spacing={4} width="full">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    flex="1"
                    onClick={handleTransaction}
                    isLoading={loading}
                    loadingText="Processing..."
                    isDisabled={currentChainId !== HOODI_NETWORK.chainId}
                  >
                    Send Transaction
                  </Button>
                  <Button
                    colorScheme="purple"
                    size="lg"
                    flex="1"
                    onClick={switchToHoodiNetwork}
                    isLoading={loading}
                    loadingText="Switching..."
                  >
                    Switch to Hoodi
                  </Button>
                </HStack>

                {status && (
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    width="full"
                  >
                    <Text fontSize="sm" color="gray.700">
                      {status}
                    </Text>
                  </Box>
                )}

                {currentChainId && (
                  <Box
                    p={4}
                    bg={currentChainId === HOODI_NETWORK.chainId ? "green.50" : "red.50"}
                    borderRadius="md"
                    width="full"
                  >
                    <Text fontSize="sm" color={currentChainId === HOODI_NETWORK.chainId ? "green.700" : "red.700"}>
                      Current Network: {currentChainId === HOODI_NETWORK.chainId ? 'Hoodi Network' : 'Wrong Network'}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  )
}

export default App
