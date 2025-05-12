from dataclasses import dataclass
from typing import List
import json
from pathlib import Path

@dataclass
class NativeCurrency:
    name: str
    symbol: str
    decimals: int

@dataclass
class NetworkConfig:
    chainId: int
    chainName: str
    nativeCurrency: NativeCurrency
    rpcUrls: List[str]
    blockExplorerUrls: List[str]

@dataclass
class ContractsConfig:
    multicall: str
    token: str

@dataclass
class RecipientsConfig:
    recipient1: str
    recipient2: str

@dataclass
class TransactionsConfig:
    tokenTransferAmount: str
    ethTransfer1Amount: str
    ethTransfer2Amount: str

@dataclass
class AppConfig:
    network: NetworkConfig
    contracts: ContractsConfig
    recipients: RecipientsConfig
    transactions: TransactionsConfig

def load_config() -> AppConfig:
    config_path = Path(__file__).parent / 'config.json'
    with open(config_path, 'r') as f:
        data = json.load(f)
    
    return AppConfig(
        network=NetworkConfig(
            chainId=data['network']['chainId'],
            chainName=data['network']['chainName'],
            nativeCurrency=NativeCurrency(**data['network']['nativeCurrency']),
            rpcUrls=data['network']['rpcUrls'],
            blockExplorerUrls=data['network']['blockExplorerUrls']
        ),
        contracts=ContractsConfig(**data['contracts']),
        recipients=RecipientsConfig(**data['recipients']),
        transactions=TransactionsConfig(**data['transactions'])
    )

# Export config instance
config = load_config() 