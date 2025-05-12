export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface ContractsConfig {
  multicall: string;
  token: string;
}

export interface RecipientsConfig {
  recipient1: string;
  recipient2: string;
}

export interface TransactionsConfig {
  tokenTransferAmount: string;
  ethTransfer1Amount: string;
  ethTransfer2Amount: string;
}

export interface AppConfig {
  network: NetworkConfig;
  contracts: ContractsConfig;
  recipients: RecipientsConfig;
  transactions: TransactionsConfig;
}

// Load and validate config
import config from '../../../config.json';
export const appConfig: AppConfig = config; 