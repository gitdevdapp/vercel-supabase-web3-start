# Scaffold-ETH 2 Deployment Guide

**Complete guide for deploying smart contracts and frontend applications with Scaffold-ETH 2 framework.**

## 🎯 Overview

This guide covers all aspects of deployment in Scaffold-ETH 2, from local development to production deployment on multiple networks.

## 📋 Deployment Types

### 1. Local Development Deployment
### 2. Testnet Deployment
### 3. Mainnet Deployment
### 4. Frontend Deployment

## 🚀 Local Development Deployment

### Setup Local Blockchain

```bash
# Terminal 1: Start local blockchain
yarn chain

# This starts a local Hardhat/Founry network at http://localhost:8545
# Features:
# - Auto-mining
# - Rich pre-funded accounts
# - Contract hot reloading
# - Console for debugging
```

### Deploy Contracts Locally

```bash
# Terminal 2: Deploy all contracts
yarn deploy

# Deploy specific contract
yarn deploy --tags MyContract

# Deploy with custom network config
yarn deploy --network localhost
```

### Contract Hot Reloading

```typescript
// Changes to contracts in packages/hardhat/contracts/ or packages/foundry/contracts/
// automatically trigger re-deployment on local network

// 1. Edit contract
// 2. Save file
// 3. Contracts automatically redeploy
// 4. Frontend updates with new ABI and address
```

## 🌐 Testnet Deployment

### Network Configuration

```typescript
// packages/nextjs/utils/chains.ts
import { defineChain } from 'viem';

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
      apiUrl: 'https://api-sepolia.basescan.org/api',
    },
  },
  testnet: true,
});

export const optimismSepolia = defineChain({
  id: 11155420,
  name: 'Optimism Sepolia',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.optimism.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Optimism Explorer',
      url: 'https://sepolia-optimism.etherscan.io',
    },
  },
  testnet: true,
});
```

### Update Scaffold Config

```typescript
// packages/nextjs/scaffold.config.ts
import { baseSepolia, optimismSepolia } from './utils/chains';

const scaffoldConfig = {
  targetNetworks: [baseSepolia, optimismSepolia],
  pollingInterval: 30000,
  onlyLocalBurnerWallet: false,
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
```

### Deploy to Testnet

```bash
# Get testnet ETH first (faucets)
# Base Sepolia: https://sepoliafaucet.com/
# Optimism Sepolia: https://optimismfaucet.xyz/

# Deploy to Base Sepolia
yarn deploy --network baseSepolia

# Deploy to Optimism Sepolia
yarn deploy --network optimismSepolia

# Deploy specific contract
yarn deploy --network baseSepolia --tags ERC721Factory

# Verify contract on block explorer
yarn verify --network baseSepolia
```

### Hardhat Configuration

```typescript
// packages/hardhat/hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      gasPrice: 1000000000, // 1 gwei
    },
    optimismSepolia: {
      url: 'https://sepolia.optimism.io',
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
      gasPrice: 100000000, // 0.1 gwei
    },
  },

  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
      optimismSepolia: process.env.OPTIMISMSCAN_API_KEY!,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
```

### Foundry Configuration (Alternative)

```toml
# packages/foundry/foundry.toml
[profile.default]
src = 'src'
out = 'out'
libs = ['lib']
solc = '0.8.20'
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
base_sepolia = "https://sepolia.base.org"
optimism_sepolia = "https://sepolia.optimism.io"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}" }
optimism_sepolia = { key = "${OPTIMISMSCAN_API_KEY}" }
```

## 🏭 Mainnet Deployment

### Production Network Setup

```typescript
// packages/nextjs/utils/chains.ts
import { base, optimism, mainnet } from 'wagmi/chains';

export const productionChains = [base, optimism, mainnet];
```

### Environment Variables

```bash
# packages/nextjs/.env.local
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id

# Deployment keys (KEEP SECRET)
DEPLOYER_PRIVATE_KEY=your_production_deployer_key
BASESCAN_API_KEY=your_basescan_api_key
OPTIMISMSCAN_API_KEY=your_optimismscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Mainnet Deployment

```bash
# 1. Final testing on testnet
yarn deploy --network baseSepolia
yarn verify --network baseSepolia

# 2. Deploy to Base mainnet
yarn deploy --network base

# 3. Verify on BaseScan
yarn verify --network base

# 4. Update frontend configuration
# Update packages/nextjs/scaffold.config.ts with mainnet networks
```

### Multi-Network Deployment Strategy

```typescript
// packages/hardhat/deploy/00_multi-network.ts
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();
  const isMainnet = ['1', '8453', '10'].includes(chainId);

  // Deploy with different parameters based on network
  const maxSupply = isMainnet ? 10000 : 1000;
  const mintPrice = isMainnet ? ethers.parseEther('0.1') : 0;

  await deploy('MyContract', {
    from: deployer,
    args: ['My NFT', 'MNFT', maxSupply, mintPrice],
    log: true,
    waitConfirmations: isMainnet ? 3 : 1,
  });
};

export default func;
func.tags = ['MyContract'];
```

## 🌐 Frontend Deployment

### Build Configuration

```bash
# Build for production
yarn build

# Preview production build
yarn preview

# Export static files (if needed)
yarn export
```

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

### Manual Deployment

```bash
# Build and export
yarn build
yarn export

# Deploy to static hosting (Netlify, GitHub Pages, etc.)
# Upload the out/ directory
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t my-dapp .
docker run -p 3000:80 my-dapp
```

## 🔧 Deployment Scripts

### Hardhat Deployment Scripts

```typescript
// packages/hardhat/deploy/01_deploy_erc721.ts
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ERC721_CONTRACT } from '../contracts/ERC721Contract';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying ERC721 contract...');
  console.log('Deployer:', deployer);

  const result = await deploy('MyERC721', {
    from: deployer,
    args: [
      'My NFT Collection',
      'MNFT',
      10000, // maxSupply
      ethers.parseEther('0.01'), // mintPrice
    ],
    log: true,
    waitConfirmations: 2,
  });

  console.log('✅ ERC721 deployed:', result.address);

  // Verify contract parameters
  const contract = await hre.ethers.getContractAt('MyERC721', result.address);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const maxSupply = await contract.maxSupply();

  console.log('Contract verification:', { name, symbol, maxSupply: maxSupply.toString() });
};

export default func;
func.tags = ['ERC721', 'MyERC721'];
```

### Foundry Deployment Scripts

```solidity
// packages/foundry/script/DeployERC721.s.sol
pragma solidity ^0.8.20;

import {Script, console} from 'forge-std/Script.sol';
import {MyERC721} from '../contracts/MyERC721.sol';

contract DeployERC721 is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint('DEPLOYER_PRIVATE_KEY');
        vm.startBroadcast(deployerPrivateKey);

        MyERC721 nft = new MyERC721(
            'My NFT Collection',
            'MNFT',
            10000,
            0.01 ether
        );

        console.log('✅ ERC721 deployed at:', address(nft));

        vm.stopBroadcast();
    }
}
```

```bash
# Deploy with Foundry
yarn deploy --file DeployERC721.s.sol --network base
```

## 🔍 Contract Verification

### Automatic Verification

```bash
# Verify all deployed contracts
yarn verify --network base

# Verify specific contract
yarn verify --network base MyERC721

# Verify with constructor arguments
yarn verify --network base MyERC721 "My NFT Collection" "MNFT" 10000 "10000000000000000"
```

### Manual Verification

```typescript
// packages/hardhat/tasks/verify-contract.ts
import { task } from 'hardhat/config';

task('verify-contract', 'Verify contract on block explorer')
  .addParam('contract', 'Contract name')
  .addParam('address', 'Contract address')
  .setAction(async (taskArgs, hre) => {
    await hre.run('verify:verify', {
      address: taskArgs.address,
      constructorArguments: [], // Add constructor args if needed
    });
  });
```

## 📊 Deployment Monitoring

### Deployment Status Tracking

```typescript
// lib/deployment-tracker.ts
export class DeploymentTracker {
  static async trackDeployment(params: {
    contractName: string;
    network: string;
    address: string;
    txHash: string;
    deployer: string;
  }) {
    // Track deployment in database or external service
    console.log('📊 Deployment tracked:', params);

    // Send notifications
    await this.sendNotification(params);
  }

  static async sendNotification(params: any) {
    // Slack, Discord, email notifications
  }
}
```

### Gas Usage Monitoring

```typescript
// packages/hardhat/deploy/00_monitor_gas.ts
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export async function monitorGasUsage(hre: HardhatRuntimeEnvironment) {
  const { network } = hre;

  console.log(`\n🚀 Gas usage on ${network.name}:`);

  // Get deployment cost
  const [deployer] = await hre.ethers.getSigners();
  const balanceBefore = await deployer.getBalance();

  // Deploy contract
  const tx = await hre.deployments.deploy('MyContract', {
    from: deployer.address,
    args: ['Test', 'TEST', 1000, 0],
  });

  const balanceAfter = await deployer.getBalance();
  const gasUsed = balanceBefore - balanceAfter;

  console.log(`Gas used: ${hre.ethers.formatEther(gasUsed)} ETH`);
  console.log(`Contract address: ${tx.address}`);

  return {
    gasUsed: gasUsed.toString(),
    gasPrice: tx.gasPrice?.toString(),
    gasLimit: tx.gasLimit?.toString(),
  };
}
```

## 🧪 Testing Deployments

### Pre-Deployment Checks

```typescript
// packages/hardhat/scripts/pre-deployment-check.ts
import { ethers } from 'hardhat';

export async function preDeploymentCheck() {
  console.log('🔍 Running pre-deployment checks...');

  // 1. Check network connectivity
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log('✅ Network connected:', network.name);

  // 2. Check account balance
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  const minBalance = ethers.parseEther('0.1');

  if (balance < minBalance) {
    throw new Error(`Insufficient balance: ${ethers.formatEther(balance)} ETH`);
  }
  console.log('✅ Balance sufficient:', ethers.formatEther(balance), 'ETH');

  // 3. Check gas price
  const gasPrice = await provider.getGasPrice();
  console.log('✅ Gas price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');

  console.log('✅ All checks passed!');
}
```

### Post-Deployment Verification

```typescript
// packages/hardhat/scripts/post-deployment-check.ts
import { ethers } from 'hardhat';

export async function postDeploymentCheck(contractAddress: string) {
  console.log('🔍 Verifying deployment...');

  const contract = await ethers.getContractAt('MyERC721', contractAddress);

  // 1. Check contract is deployed
  const code = await ethers.provider.getCode(contractAddress);
  if (code === '0x') {
    throw new Error('Contract not deployed');
  }
  console.log('✅ Contract deployed successfully');

  // 2. Check contract parameters
  const name = await contract.name();
  const symbol = await contract.symbol();
  const maxSupply = await contract.maxSupply();

  console.log('✅ Contract parameters:', { name, symbol, maxSupply: maxSupply.toString() });

  // 3. Test basic functionality
  const totalSupply = await contract.totalSupply();
  console.log('✅ Total supply:', totalSupply.toString());

  console.log('✅ All verifications passed!');
}
```

## 🚨 Error Handling and Recovery

### Common Deployment Errors

```typescript
// lib/deployment-error-handler.ts
export class DeploymentErrorHandler {
  static handleError(error: any, context: string) {
    console.error(`❌ Deployment failed in ${context}:`, error.message);

    switch (error.code) {
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds for deployment. Please add more ETH.';

      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your RPC URL.';

      case 'NONCE_EXPIRED':
        return 'Transaction nonce expired. Please reset your account nonce.';

      case 'REPLACEMENT_UNDERPRICED':
        return 'Gas price too low. Please increase gas price.';

      default:
        return `Unknown error: ${error.message}`;
    }
  }

  static async retryDeployment(retryCount: number = 3) {
    for (let i = 0; i < retryCount; i++) {
      try {
        await this.deployContract();
        return true;
      } catch (error) {
        console.log(`Retry ${i + 1} failed:`, error.message);

        if (i < retryCount - 1) {
          await this.wait(2000 * (i + 1)); // Exponential backoff
        }
      }
    }
    return false;
  }
}
```

### Deployment Rollback

```typescript
// lib/deployment-rollback.ts
export class DeploymentRollback {
  static async rollbackToSnapshot(snapshotId: string) {
    // Reset blockchain state to previous snapshot
    await hre.network.provider.request({
      method: 'evm_revert',
      params: [snapshotId],
    });
  }

  static async createSnapshot() {
    const snapshotId = await hre.network.provider.request({
      method: 'evm_snapshot',
      params: [],
    });
    return snapshotId;
  }

  static async rollbackDeployment(deploymentLog: any[]) {
    console.log('🔄 Rolling back deployment...');

    // Reverse deployment order
    for (const deployment of deploymentLog.reverse()) {
      try {
        // Self-destruct contract if possible
        if (deployment.contract.supportsSelfDestruct) {
          await deployment.contract.destroy();
          console.log(`✅ Self-destructed: ${deployment.address}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not rollback: ${deployment.address}`);
      }
    }
  }
}
```

## 📈 Deployment Analytics

### Deployment Metrics

```typescript
// lib/deployment-metrics.ts
export interface DeploymentMetrics {
  contractName: string;
  network: string;
  gasUsed: string;
  gasPrice: string;
  deploymentTime: number;
  cost: string;
  timestamp: Date;
}

export class DeploymentAnalytics {
  static async collectMetrics(deploymentResult: any): Promise<DeploymentMetrics> {
    const tx = await ethers.provider.getTransaction(deploymentResult.transactionHash);
    const receipt = await ethers.provider.getTransactionReceipt(deploymentResult.transactionHash);

    const gasCost = tx.gasPrice * receipt.gasUsed;
    const costEth = ethers.formatEther(gasCost);

    return {
      contractName: deploymentResult.contractName,
      network: hre.network.name,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice.toString(),
      deploymentTime: Date.now() - deploymentResult.startTime,
      cost: costEth,
      timestamp: new Date(),
    };
  }

  static async saveMetrics(metrics: DeploymentMetrics) {
    // Save to database, file, or external service
    console.log('📊 Deployment metrics:', metrics);
  }
}
```

## 🔐 Security Considerations

### Production Deployment Security

```typescript
// packages/hardhat/scripts/security-check.ts
export async function securityCheck() {
  console.log('🔒 Running security checks...');

  // 1. Check deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);

  // 2. Check network
  const network = await ethers.provider.getNetwork();
  console.log('Network:', network.name, 'Chain ID:', network.chainId);

  // 3. Check balance
  const balance = await deployer.getBalance();
  const minBalance = ethers.parseEther('1'); // Require 1 ETH minimum

  if (balance < minBalance) {
    throw new Error(`Insufficient balance: ${ethers.formatEther(balance)} ETH`);
  }

  // 4. Verify no previous deployment conflicts
  // ... additional checks

  console.log('✅ Security checks passed');
}
```

### Access Control

```typescript
// Only allow deployment from authorized accounts
const AUTHORIZED_DEPLOYERS = [
  '0x1234...', // Your main deployer
  '0x5678...', // Backup deployer
];

export function isAuthorizedDeployer(address: string): boolean {
  return AUTHORIZED_DEPLOYERS.includes(address.toLowerCase());
}
```

## 🎯 Deployment Best Practices

### 1. Environment-Specific Configuration

```typescript
// packages/hardhat/hardhat.config.ts
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_RPC_URL || '',
      },
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 1000000000,
    },
  },
};
```

### 2. Incremental Deployments

```bash
# 1. Deploy core contracts first
yarn deploy --tags core

# 2. Deploy feature contracts
yarn deploy --tags features

# 3. Deploy integrations
yarn deploy --tags integrations

# 4. Full deployment
yarn deploy
```

### 3. Automated Testing

```typescript
// packages/hardhat/test/deployment.test.ts
import { expect } from 'chai';
import { deployments, ethers } from 'hardhat';

describe('Deployment', function () {
  beforeEach(async function () {
    await deployments.fixture(['MyContract']);
  });

  it('should deploy MyContract', async function () {
    const contract = await ethers.getContract('MyContract');
    expect(await contract.name()).to.equal('My NFT Collection');
  });

  it('should have correct owner', async function () {
    const contract = await ethers.getContract('MyContract');
    const [deployer] = await ethers.getSigners();
    expect(await contract.owner()).to.equal(deployer.address);
  });
});
```

## 📚 Deployment Examples

### ERC721 Deployment

```typescript
// packages/hardhat/deploy/02_deploy_erc721_factory.ts
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('🚀 Deploying ERC721 Factory...');

  const result = await deploy('ERC721Factory', {
    from: deployer,
    args: [
      'My NFT Factory',
      'MNFTF',
    ],
    log: true,
    waitConfirmations: 2,
  });

  console.log('✅ ERC721 Factory deployed at:', result.address);

  // Save deployment info for frontend
  await deployments.save('ERC721Factory', {
    address: result.address,
    abi: result.abi,
    transactionHash: result.transactionHash,
  });
};

export default func;
func.tags = ['ERC721Factory'];
func.dependencies = ['core'];
```

### Multi-Contract Deployment

```typescript
// packages/hardhat/deploy/03_deploy_full_system.ts
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  // 1. Deploy token contract
  const token = await deploy('MyToken', {
    from: deployer,
    args: ['My Token', 'MTK', 18],
  });

  // 2. Deploy NFT contract
  const nft = await deploy('MyNFT', {
    from: deployer,
    args: ['My NFT', 'MNFT', token.address],
  });

  // 3. Deploy staking contract
  const staking = await deploy('Staking', {
    from: deployer,
    args: [token.address, nft.address],
  });

  console.log('✅ Full system deployed:');
  console.log('  Token:', token.address);
  console.log('  NFT:', nft.address);
  console.log('  Staking:', staking.address);
};

export default func;
func.tags = ['full-system'];
func.dependencies = ['MyToken', 'MyNFT', 'Staking'];
```

## 🎉 Deployment Checklist

### Pre-Deployment
- [ ] ✅ Environment variables configured
- [ ] ✅ Network RPC URLs tested
- [ ] ✅ Deployer account funded
- [ ] ✅ Contract code reviewed
- [ ] ✅ Tests passing
- [ ] ✅ Gas estimates calculated

### During Deployment
- [ ] ✅ Monitor gas usage
- [ ] ✅ Track deployment progress
- [ ] ✅ Verify contract addresses
- [ ] ✅ Check transaction confirmations
- [ ] ✅ Test basic functionality

### Post-Deployment
- [ ] ✅ Contract verification on explorer
- [ ] ✅ Frontend configuration updated
- [ ] ✅ Integration tests run
- [ ] ✅ Security audit completed
- [ ] ✅ Documentation updated
- [ ] ✅ Backup keys secured

## 🚨 Troubleshooting

### Common Issues

1. **Out of Gas**
   ```bash
   # Increase gas limit in hardhat.config.ts
   networks: {
     base: {
       gasLimit: 8000000, // Increase from default
     }
   }
   ```

2. **Nonce Issues**
   ```bash
   # Reset nonce in MetaMask or use different account
   # Or wait for pending transactions to clear
   ```

3. **RPC Connection Issues**
   ```typescript
   // Check RPC URL and network connectivity
   const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
   const network = await provider.getNetwork();
   console.log('Connected to:', network.name);
   ```

4. **Verification Failures**
   ```bash
   # Check constructor arguments
   yarn verify --network base MyContract "Arg1" "Arg2"

   # Flatten contracts if needed
   yarn hardhat flatten contracts/MyContract.sol
   ```

## 📈 Performance Optimization

### Gas Optimization

```typescript
// Optimize contract for lower gas usage
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for 200 runs
        details: {
          yul: false,
          deduplicate: true,
          cse: true,
          constantOptimizer: true,
        },
      },
    },
  },
};
```

### Deployment Speed

```bash
# Parallel deployment
yarn deploy --parallel

# Skip confirmation prompts
yarn deploy --yes

# Use higher gas price for faster confirmation
DEPLOYER_GAS_PRICE=5000000000 yarn deploy
```

## 🔮 Advanced Deployment Features

### Multi-Sig Deployments

```typescript
// Deploy through Gnosis Safe or other multi-sig
const multiSigAddress = '0x1234...';
const safeSDK = new SafeSDK(multiSigAddress);

// Create deployment transaction
const tx = await safeSDK.createTransaction({
  to: '0x0000...', // Contract factory
  data: deploymentData,
  value: '0',
});

// Submit for signatures
await safeSDK.submitTransaction(tx);
```

### Staged Deployments

```typescript
// Deploy in stages for complex systems
const stages = [
  { name: 'Core', contracts: ['Token', 'NFT'] },
  { name: 'Features', contracts: ['Staking', 'Governance'] },
  { name: 'Integrations', contracts: ['Bridge', 'DEX'] },
];

for (const stage of stages) {
  console.log(`🚀 Deploying stage: ${stage.name}`);
  await deployStage(stage.contracts);
}
```

This comprehensive deployment guide covers all aspects of deploying with Scaffold-ETH 2, from local development to production deployment with security best practices and troubleshooting.
