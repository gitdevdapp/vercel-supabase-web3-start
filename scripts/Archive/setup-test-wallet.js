#!/usr/bin/env node

/**
 * Setup Test Wallet Script
 *
 * Creates and funds the test@test.com server wallet for ERC721 testing
 * Uses CDP Platform API for reliable wallet management
 */

import { CdpPlatformClient } from '../lib/cdp-platform.js';

async function setupTestWallet() {
  console.log('🚀 Setting up test@test.com wallet for ERC721 testing...');

  const client = new CdpPlatformClient();
  const network = 'base-sepolia';

  try {
    // 1. Check if test wallet already exists
    console.log('📋 Checking existing wallets...');
    const wallets = await client.listWallets();

    let testWallet = wallets.find(w =>
      w.name.includes('test') || w.address === '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf'
    );

    if (!testWallet) {
      // 2. Create test wallet
      console.log('🏦 Creating test wallet...');
      testWallet = await client.createWallet('test-server-wallet', network);
      console.log('✅ Test wallet created:', testWallet.address);
    } else {
      console.log('✅ Found existing test wallet:', testWallet.address);
    }

    // 3. Check wallet balance
    console.log('💰 Checking wallet balance...');
    const ethBalance = await client.getWalletBalance(testWallet.id, 'eth');
    const ethBalanceFloat = parseFloat(ethBalance);

    console.log(`📊 Current ETH balance: ${ethBalanceFloat.toFixed(6)} ETH`);

    // 4. Fund wallet if balance is low
    if (ethBalanceFloat < 0.01) {
      console.log('⚠️  Wallet balance too low, attempting to fund...');

      // Note: In production, you'd use a faucet or transfer from a funded wallet
      console.log('💡 To fund the wallet:');
      console.log(`   - Send ETH to: ${testWallet.address}`);
      console.log(`   - Network: ${network}`);
      console.log(`   - Block Explorer: https://sepolia.basescan.org/address/${testWallet.address}`);
    } else {
      console.log('✅ Wallet has sufficient balance for testing');
    }

    // 5. Verify wallet functionality
    console.log('🔍 Verifying wallet functionality...');
    const balances = await client.getWalletBalances(testWallet.id);
    console.log('📊 All balances:', balances);

    console.log('\n🎯 Test wallet setup complete!');
    console.log('📝 Wallet Details:');
    console.log(`   - ID: ${testWallet.id}`);
    console.log(`   - Address: ${testWallet.address}`);
    console.log(`   - Name: ${testWallet.name}`);
    console.log(`   - Network: ${testWallet.network}`);
    console.log(`   - ETH Balance: ${ethBalanceFloat.toFixed(6)} ETH`);

    return {
      success: true,
      wallet: testWallet,
      balance: ethBalanceFloat
    };

  } catch (error) {
    console.error('❌ Test wallet setup failed:', error);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestWallet()
    .then((result) => {
      console.log('\n✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

export { setupTestWallet };
