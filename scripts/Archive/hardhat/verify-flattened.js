#!/usr/bin/env node

/**
 * Contract Verification Script - Using Flattened Source
 * Uses Etherscan API V2 to verify contracts with flattened source code
 */

import fs from 'fs';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const CHAIN_ID = 84532; // Base Sepolia
const API_URL = 'https://api.etherscan.io/v2/api';
const COMPILER_VERSION = 'v0.8.20+commit.a1b79de6';

if (!ETHERSCAN_API_KEY) {
  console.error('❌ Error: ETHERSCAN_API_KEY environment variable is not set');
  process.exit(1);
}

/**
 * Verify contract via Etherscan API with flattened source
 */
async function verifyContract(contractAddress, flattenedSourcePath, encodedConstructorArgs) {
  const sourceCode = fs.readFileSync(flattenedSourcePath, 'utf8');
  
  console.log('\n📋 Verification Details:');
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Chain ID: ${CHAIN_ID}`);
  console.log(`   Compiler Version: ${COMPILER_VERSION}`);
  console.log(`   Optimization: Enabled (200 runs)`);
  console.log(`   Source Code Length: ${sourceCode.length} bytes`);
  
  // Check current status first
  console.log('\n🔍 Checking current verification status...');
  const checkParams = new URLSearchParams({
    chainid: CHAIN_ID,
    module: 'contract',
    action: 'getsourcecode',
    address: contractAddress,
    apikey: ETHERSCAN_API_KEY
  });
  
  try {
    const checkResponse = await fetch(`${API_URL}?${checkParams}`);
    const checkData = await checkResponse.json();
    
    if (checkData.result && checkData.result[0]) {
      const result = checkData.result[0];
      if (result.SourceCode && result.SourceCode !== '') {
        console.log('✅ Contract is ALREADY VERIFIED!');
        console.log(`   Contract Name: ${result.ContractName}`);
        console.log(`   Compiler: ${result.CompilerVersion}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`⚠️  Error checking status: ${error.message}`);
  }
  
  console.log('⏳ Contract is not verified, attempting verification...');
  
  // Attempt verification
  const verifyParams = new URLSearchParams({
    apikey: ETHERSCAN_API_KEY,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: 'SimpleERC721',
    compilerversion: COMPILER_VERSION,
    optimizationUsed: '1',
    runs: '200',
    constructorArguements: encodedConstructorArgs,
    evmversion: 'istanbul',
    licenseType: '1' // MIT License
  });
  
  try {
    console.log('\n📤 Submitting verification request to Etherscan...');
    const postUrl = `${API_URL}?chainid=${CHAIN_ID}`;
    const response = await fetch(postUrl, {
      method: 'POST',
      body: verifyParams
    });
    
    const data = await response.json();
    
    if (data.status === '1') {
      const guid = data.result;
      console.log(`✅ Verification submitted successfully!`);
      console.log(`   GUID: ${guid}`);
      console.log('\n⏳ Checking verification status (this may take 30-60 seconds)...');
      
      // Poll for completion
      return await pollVerificationStatus(contractAddress, guid);
    } else if (data.status === '0' && data.result && data.result.includes('already verified')) {
      console.log('✅ Contract is ALREADY VERIFIED!');
      return true;
    } else {
      console.error(`❌ Verification failed: ${data.result || data.message}`);
      console.error(`   Status: ${data.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Poll for verification completion
 */
async function pollVerificationStatus(contractAddress, guid) {
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
    
    const checkParams = new URLSearchParams({
      chainid: CHAIN_ID,
      apikey: ETHERSCAN_API_KEY,
      guid: guid,
      module: 'contract',
      action: 'checkverifystatus'
    });
    
    try {
      const response = await fetch(`${API_URL}?${checkParams}`);
      const data = await response.json();
      
      if (data.result === '1') {
        console.log('✅ Verification completed successfully!');
        console.log(`   Contract: ${contractAddress}`);
        console.log(`   Explorer: https://sepolia.basescan.org/address/${contractAddress}#code`);
        return true;
      } else if (data.result === '0') {
        console.log(`⏳ Verification in progress... (${attempts}/${maxAttempts})`);
      } else if (data.result && data.result.startsWith('Fail')) {
        console.error(`❌ ${data.result}`);
        return false;
      } else {
        console.log(`⚠️  Status: ${data.result}`);
      }
    } catch (error) {
      console.error(`⚠️  Poll error: ${error.message}`);
    }
  }
  
  console.log('⚠️  Verification polling timeout. Check status manually at:');
  console.log(`   https://sepolia.basescan.org/address/${contractAddress}#code`);
  return false;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node verify-flattened.js <CONTRACT_ADDRESS> <FLATTENED_SOURCE_PATH> <ENCODED_CONSTRUCTOR_ARGS>');
    process.exit(1);
  }
  
  const contractAddress = args[0];
  const flattenedSourcePath = args[1];
  const encodedArgs = args[2];
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    console.error(`❌ Invalid contract address: ${contractAddress}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(flattenedSourcePath)) {
    console.error(`❌ File not found: ${flattenedSourcePath}`);
    process.exit(1);
  }
  
  console.log('🚀 Etherscan Contract Verification Script (Flattened Source)');
  console.log('============================================================');
  
  const success = await verifyContract(contractAddress, flattenedSourcePath, encodedArgs);
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
