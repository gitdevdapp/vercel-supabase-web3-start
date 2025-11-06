import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface ERC721DeploymentParams {
  name: string;
  symbol: string;
  maxSupply: number;
  mintPrice: string;
}

export interface ERC721DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  network: string;
  status: 'confirmed';
  created_at: string;
}

/**
 * ✅ REAL ERC721 Contract Deployment to Base Sepolia
 * 
 * Uses ethers.js directly with a funded deployer account
 * - Signs and broadcasts REAL transactions
 * - Spends real ETH gas from deployer wallet
 * - Returns VERIFIED contract addresses and transaction hashes
 * - Contracts are permanent and verifiable on BaseScan
 * 
 * Status: WORKING - No CDP SDK complexity, just direct blockchain interaction
 */
export async function deployERC721(
  params: ERC721DeploymentParams
): Promise<ERC721DeploymentResult> {
  try {
    console.log('🔧 Initializing REAL ERC721 deployment...');
    console.log('  Name:', params.name);
    console.log('  Symbol:', params.symbol);
    console.log('  Max Supply:', params.maxSupply);
    console.log('  Mint Price:', params.mintPrice, 'wei');
    
    // Load contract artifact
    const artifactPath = join(process.cwd(), 'artifacts/contracts/SimpleERC721.sol/SimpleERC721.json');
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8'));
    
    console.log('✅ SimpleERC721 contract artifact loaded');
    
    // Get deployer private key from environment
    const deployerPrivateKey = process.env.CDP_DEPLOYER_PRIVATE_KEY;
    if (!deployerPrivateKey) {
      throw new Error('CDP_DEPLOYER_PRIVATE_KEY not configured - cannot deploy without funded account');
    }
    
    // Initialize provider to Base Sepolia
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);
    console.log('📝 Deployer wallet:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Wallet balance: ${balanceEth} ETH`);
    
    if (Number(balanceEth) < 0.001) {
      throw new Error(`Insufficient balance. Need at least 0.001 ETH, have ${balanceEth} ETH`);
    }
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet
    );
    
    console.log('🚀 Deploying ERC721 contract to Base Sepolia...');
    
    // Deploy contract with constructor arguments
    const contract = await factory.deploy(
      params.name,
      params.symbol,
      BigInt(params.maxSupply),
      BigInt(params.mintPrice),
      'https://example.com/metadata/'
    );
    
    // Get deployment transaction
    const deploymentTx = contract.deploymentTransaction();
    if (!deploymentTx) {
      throw new Error('Failed to get deployment transaction');
    }
    
    console.log('📤 Deployment transaction hash:', deploymentTx.hash);
    
    // Wait for confirmation
    console.log('⏳ Waiting for block confirmation (1-2 blocks)...');
    const receipt = await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log('✅ REAL ERC721 DEPLOYMENT COMPLETE!');
    console.log('  Contract Address:', contractAddress);
    console.log('  Transaction Hash:', deploymentTx.hash);
    console.log('  Network: Base Sepolia Testnet');
    console.log('  View on BaseScan: https://sepolia.basescan.org/address/' + contractAddress);
    
    return {
      contractAddress,
      transactionHash: deploymentTx.hash,
      network: 'base-sepolia',
      status: 'confirmed',
      created_at: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.error('❌ ERC721 deployment failed:', error.message);
    throw new Error(`ERC721 deployment failed: ${error.message}`);
  }
}

/**
 * Verify deployed contract on BaseScan
 */
export function getBaseScanUrl(contractAddress: string): string {
  return `https://sepolia.basescan.org/address/${contractAddress}`;
}
