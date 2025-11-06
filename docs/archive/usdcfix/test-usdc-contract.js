#!/usr/bin/env node

/**
 * Test script to verify USDC contract on Base Sepolia
 * and test balance fetching directly
 */

import { ethers } from 'ethers';

const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const TEST_WALLET_ADDRESS = "0x96f8FDfe2f2244D71D2F4cddbbD0f9A9e59cBe44";

const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const RPC_URLS = [
  "https://sepolia.base.org",
  "https://base-sepolia.publicnode.com",
  "https://base-sepolia.g.alchemy.com/v2/demo" // Limited but works for testing
];

async function testUSDCContract() {
  console.log('🧪 Testing USDC Contract on Base Sepolia\n');

  for (const rpcUrl of RPC_URLS) {
    console.log(`🔍 Testing RPC: ${rpcUrl}`);

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // Test 1: Check if contract exists
      console.log('  📋 Checking contract code...');
      const code = await provider.getCode(USDC_CONTRACT_ADDRESS);
      console.log(`  ✅ Contract exists: ${code !== '0x' ? 'YES' : 'NO'}`);
      console.log(`  📏 Code length: ${code.length} bytes`);

      if (code === '0x') {
        console.log('  ❌ Contract does not exist at this address\n');
        continue;
      }

      // Test 2: Check contract decimals
      console.log('  🔢 Checking contract decimals...');
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider);
      const decimals = await usdcContract.decimals();
      console.log(`  ✅ Decimals: ${decimals}`);

      // Test 3: Check balance
      console.log('  💰 Checking balance for test wallet...');
      const balance = await usdcContract.balanceOf(TEST_WALLET_ADDRESS);
      const balanceFormatted = Number(balance) / 1000000; // USDC has 6 decimals
      console.log(`  ✅ Raw balance: ${balance.toString()}`);
      console.log(`  ✅ Formatted balance: ${balanceFormatted} USDC`);

      // Test 4: ETH balance for comparison
      console.log('  🤑 Checking ETH balance...');
      const ethBalance = await provider.getBalance(TEST_WALLET_ADDRESS);
      const ethFormatted = Number(ethBalance) / 1000000000000000000;
      console.log(`  ✅ ETH balance: ${ethFormatted}`);

      console.log(`  🎉 SUCCESS with RPC: ${rpcUrl}\n`);
      return true;

    } catch (error) {
      console.log(`  ❌ ERROR with ${rpcUrl}: ${error.message}\n`);
    }
  }

  console.log('❌ All RPC endpoints failed');
  return false;
}

// Test raw RPC call
async function testRawRPC() {
  console.log('🔧 Testing raw RPC calls...\n');

  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
      to: USDC_CONTRACT_ADDRESS,
      data: `0x70a08231${TEST_WALLET_ADDRESS.slice(2).padStart(64, '0')}` // balanceOf(address)
    }, "latest"],
    id: 1
  };

  try {
    const response = await fetch("https://sepolia.base.org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Raw RPC result:', result);

    if (result.result && result.result !== '0x') {
      const balance = BigInt(result.result);
      const balanceFormatted = Number(balance) / 1000000;
      console.log(`✅ Raw balance: ${balance} (${balanceFormatted} USDC)`);
    } else {
      console.log('❌ Balance is zero or call failed');
    }
  } catch (error) {
    console.log('❌ Raw RPC call failed:', error.message);
  }
}

async function main() {
  console.log('🚀 USDC Contract Testing Script\n');
  console.log(`📍 Contract Address: ${USDC_CONTRACT_ADDRESS}`);
  console.log(`👛 Test Wallet: ${TEST_WALLET_ADDRESS}\n`);

  await testUSDCContract();
  await testRawRPC();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testUSDCContract, testRawRPC };
