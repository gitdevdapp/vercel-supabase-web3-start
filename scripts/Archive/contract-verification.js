#!/usr/bin/env node

/**
 * ERC721 Contract Verification Script
 * 
 * Purpose: Verify deployed ERC721 contracts on BaseScan using Hardhat
 * Usage:
 *   node scripts/contract-verification.js verify <address> [constructor-args...]
 *   node scripts/contract-verification.js list
 *   node scripts/contract-verification.js status <address>
 * 
 * Environment Requirements:
 *   - BASESCAN_API_KEY: API key for BaseScan
 *   - CDP_DEPLOYER_PRIVATE_KEY: Deployer private key (for reference)
 * 
 * Examples:
 *   # Verify a single contract
 *   node scripts/contract-verification.js verify 0x5002b5ce47583334fc8789c7702adfa220ebeaaa "MyNFT" "MNFT" 100 "0" "https://example.com/metadata/"
 *   
 *   # List all known contracts
 *   node scripts/contract-verification.js list
 *   
 *   # Check verification status
 *   node scripts/contract-verification.js status 0x5002b5ce47583334fc8789c7702adfa220ebeaaa
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Known deployed contracts - update this as new contracts are deployed
const KNOWN_CONTRACTS = {
  '0x5002b5ce47583334fc8789c7702adfa220ebeaaa': {
    name: 'SimpleERC721',
    network: 'baseSepolia',
    constructorArgs: ['ContractName', 'SYMBOL', '100', '0', 'https://example.com/metadata/'],
    status: 'pending'
  },
  '0x0055C0AC5dd5018aB52D811d6D0751810ECDadbC': {
    name: 'SimpleERC721',
    network: 'baseSepolia',
    constructorArgs: [],
    status: 'pending'
  },
  '0x5f5987441329Bb34F728E5da65C9102aECd4124F': {
    name: 'SimpleERC721',
    network: 'baseSepolia',
    constructorArgs: [],
    status: 'pending'
  }
};

const DEPLOYMENT_LOG_FILE = path.join(__dirname, '..', 'docs', 'nftmarketplace', 'deployment-log.json');

/**
 * Verify a contract on BaseScan
 */
async function verifyContract(address, constructorArgs = []) {
  console.log('\n🔍 Verifying contract:', address);
  console.log('   Constructor Args:', constructorArgs.join(' '));
  
  const baseScanKey = process.env.BASESCAN_API_KEY;
  if (!baseScanKey) {
    console.error('❌ BASESCAN_API_KEY environment variable not set');
    console.error('   Please add your BaseScan API key to .env.local');
    process.exit(1);
  }
  
  try {
    // Build the verification command
    let command = `npx hardhat verify --network baseSepolia ${address}`;
    
    // Add constructor arguments
    if (constructorArgs.length > 0) {
      const args = constructorArgs.map(arg => {
        // Quote string arguments
        if (isNaN(arg) && !arg.startsWith('0x')) {
          return `"${arg}"`;
        }
        return arg;
      }).join(' ');
      
      command += ` ${args}`;
    }
    
    console.log('   Command:', command);
    console.log('⏳ Verification in progress...');
    
    const { stdout, stderr } = await execAsync(command);
    
    // Parse output
    if (stdout.includes('Successfully verified') || stdout.includes('Already Verified')) {
      console.log('✅ Contract successfully verified!');
      console.log('   View on BaseScan: https://sepolia.basescan.org/address/' + address);
      return { success: true, message: 'Verification successful' };
    } else {
      console.error('⚠️  Verification output:', stdout);
      if (stderr) console.error('   Error:', stderr);
      return { success: false, message: stderr || 'Verification returned unexpected output' };
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    if (error.stdout) console.error('   Output:', error.stdout);
    if (error.stderr) console.error('   Error:', error.stderr);
    return { success: false, message: error.message };
  }
}

/**
 * List all known contracts
 */
function listContracts() {
  console.log('\n📋 Known Deployed Contracts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let count = 0;
  for (const [address, details] of Object.entries(KNOWN_CONTRACTS)) {
    count++;
    console.log(`\n${count}. ${address}`);
    console.log(`   Name: ${details.name}`);
    console.log(`   Network: ${details.network}`);
    console.log(`   Status: ${details.status}`);
    console.log(`   Args: ${details.constructorArgs.length > 0 ? details.constructorArgs.join(' ') : '(none)'}`);
    console.log(`   View: https://sepolia.basescan.org/address/${address}`);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total: ${count} contracts\n`);
}

/**
 * Check verification status on BaseScan
 */
async function checkStatus(address) {
  console.log('\n📊 Checking verification status for:', address);
  
  try {
    // Try to fetch from BaseScan API
    const response = await fetch(
      `https://api-sepolia.basescan.org/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.BASESCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.result && data.result[0]) {
      const contract = data.result[0];
      
      if (contract.SourceCode && contract.SourceCode !== '') {
        console.log('✅ Contract is VERIFIED on BaseScan');
        console.log('   Compiler Version:', contract.CompilerVersion);
        console.log('   Optimization:', contract.OptimizationUsed === '1' ? 'Enabled' : 'Disabled');
        console.log('   Contract Name:', contract.ContractName);
      } else {
        console.log('❌ Contract is NOT verified on BaseScan');
      }
    } else {
      console.log('⚠️  Could not fetch contract info from BaseScan');
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

/**
 * Load deployment log
 */
function loadDeploymentLog() {
  try {
    if (fs.existsSync(DEPLOYMENT_LOG_FILE)) {
      const data = fs.readFileSync(DEPLOYMENT_LOG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('⚠️  Could not load deployment log:', error.message);
  }
  return { deployments: [] };
}

/**
 * Save deployment log
 */
function saveDeploymentLog(data) {
  try {
    fs.writeFileSync(DEPLOYMENT_LOG_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Deployment log updated:', DEPLOYMENT_LOG_FILE);
  } catch (error) {
    console.error('❌ Failed to save deployment log:', error.message);
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📝 ERC721 Contract Verification Script

Usage:
  node scripts/contract-verification.js verify <address> [constructor-args...]
  node scripts/contract-verification.js list
  node scripts/contract-verification.js status <address>

Examples:
  # Verify a contract with constructor arguments
  node scripts/contract-verification.js verify 0x5002b5ce47583334fc8789c7702adfa220ebeaaa "MyNFT" "MNFT" 100 "0" "https://example.com/metadata/"
  
  # List all known contracts
  node scripts/contract-verification.js list
  
  # Check verification status
  node scripts/contract-verification.js status 0x5002b5ce47583334fc8789c7702adfa220ebeaaa

Environment Variables Required:
  BASESCAN_API_KEY  - Get from https://basescan.org/apis
    `);
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'verify': {
      if (args.length < 2) {
        console.error('❌ Missing contract address');
        process.exit(1);
      }
      const address = args[1];
      const constructorArgs = args.slice(2);
      
      const result = await verifyContract(address, constructorArgs);
      
      if (!result.success) {
        process.exit(1);
      }
      break;
    }
    
    case 'list': {
      listContracts();
      break;
    }
    
    case 'status': {
      if (args.length < 2) {
        console.error('❌ Missing contract address');
        process.exit(1);
      }
      const address = args[1];
      await checkStatus(address);
      break;
    }
    
    default: {
      console.error('❌ Unknown command:', command);
      process.exit(1);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});










