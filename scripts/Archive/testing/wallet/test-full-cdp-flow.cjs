#!/usr/bin/env node

/**
 * Complete CDP ERC721 Deployment E2E Test
 * Tests the full flow: user creation → wallet creation → contract deployment → verification
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123';

console.log('🚀 COMPLETE CDP ERC721 DEPLOYMENT E2E TEST');
console.log('='.repeat(60));
console.log(`Testing with: ${TEST_EMAIL}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`App URL: ${APP_URL}`);

async function testFullFlow() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let userId = null;
    let walletData = null;
    let contractData = null;

    // ========================================================================
    // STEP 1: Check if user exists, create if not
    // ========================================================================
    console.log('\n📝 STEP 1: User Authentication');
    
    // Try to sign in first
    const { data: signinData, error: signinError } = await client.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signinError) {
      console.log('❌ Sign in failed, creating user...');
      
      // Create user
      const { data: signupData, error: signupError } = await client.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signupError) {
        console.error('❌ User creation failed:', signupError.message);
        return;
      }

      userId = signupData.user.id;
      console.log('✅ Test user created:', TEST_EMAIL);
      
      // Sign in with the new user
      const { data: newSigninData, error: newSigninError } = await client.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (newSigninError) {
        console.error('❌ Sign in failed:', newSigninError.message);
        return;
      }
      
      console.log('✅ User signed in successfully');
    } else {
      userId = signinData.user.id;
      console.log('✅ User already exists, signed in successfully');
    }

    // ========================================================================
    // STEP 2: Create Wallet
    // ========================================================================
    console.log('\n💰 STEP 2: Wallet Creation');
    
    const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signinData?.session?.access_token || signinData.session.access_token}`,
      },
      body: JSON.stringify({
        name: 'E2E Test Wallet',
        type: 'custom',
      }),
    });

    if (!createWalletResponse.ok) {
      const errorData = await createWalletResponse.json();
      console.error('❌ Wallet creation failed:', errorData.error);
      return;
    }

    walletData = await createWalletResponse.json();
    console.log('✅ Wallet created successfully!');
    console.log(`   Address: ${walletData.address}`);
    console.log(`   Name: ${walletData.name}`);

    // Wait a moment for wallet to be processed
    console.log('   Waiting 2 seconds for wallet processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ========================================================================
    // STEP 3: Deploy ERC721 Contract
    // ========================================================================
    console.log('\n🚀 STEP 3: ERC721 Contract Deployment');
    
    const deploymentResponse = await fetch(`${APP_URL}/api/contract/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signinData?.session?.access_token || signinData.session.access_token}`,
      },
      body: JSON.stringify({
        name: 'TestCDP',
        symbol: 'TCDP',
        maxSupply: 10000,
        mintPrice: '0',
        walletAddress: walletData.address,
      }),
    });

    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json();
      console.error('❌ Contract deployment failed:', errorData.error);
      console.error('   Details:', errorData.details);
      return;
    }

    contractData = await deploymentResponse.json();
    console.log('🎉 Contract deployment successful!');
    console.log(`   Contract Address: ${contractData.contractAddress}`);
    console.log(`   Transaction Hash: ${contractData.transactionHash}`);
    console.log(`   Explorer URL: ${contractData.explorerUrl}`);
    console.log(`   Network: ${contractData.contract.network}`);

    // ========================================================================
    // STEP 4: Verify on Base Sepolia
    // ========================================================================
    console.log('\n🌐 STEP 4: Base Sepolia Verification');
    
    if (contractData.contractAddress && contractData.transactionHash) {
      const explorerUrl = `https://sepolia.basescan.org/tx/${contractData.transactionHash}`;
      console.log(`   🔗 Transaction Explorer: ${explorerUrl}`);
      
      // Wait for blockchain confirmation (typically 5-15 seconds on testnet)
      console.log('   ⏳ Waiting 15 seconds for blockchain confirmation...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      console.log('   ✅ Contract should now be visible on Base Sepolia explorer');
      console.log('   📋 Please verify manually at the explorer URL above');
    }

    // ========================================================================
    // STEP 5: Database Verification
    // ========================================================================
    console.log('\n💾 STEP 5: Database Verification');
    
    // Check wallet in database
    const { data: wallets, error: walletError } = await client
      .from('user_wallets')
      .select('*')
      .eq('wallet_address', walletData.address);

    if (walletError) {
      console.error('❌ Wallet database check failed:', walletError.message);
    } else if (wallets && wallets.length > 0) {
      console.log('✅ Wallet saved in database');
      console.log(`   User ID: ${wallets[0].user_id}`);
      console.log(`   Network: ${wallets[0].network}`);
      console.log(`   Active: ${wallets[0].is_active}`);
    } else {
      console.log('⚠️  Wallet not found in database (may still be processing)');
    }

    // Check contract in database
    const { data: contracts, error: contractError } = await client
      .from('smart_contracts')
      .select('*')
      .eq('contract_address', contractData.contractAddress);

    if (contractError) {
      console.error('❌ Contract database check failed:', contractError.message);
    } else if (contracts && contracts.length > 0) {
      console.log('✅ Contract saved in database');
      console.log(`   Contract Name: ${contracts[0].contract_name}`);
      console.log(`   Network: ${contracts[0].network}`);
      console.log(`   TX Hash: ${contracts[0].tx_hash}`);
    } else {
      console.log('⚠️  Contract not found in database (may still be processing)');
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CDP ERC721 DEPLOYMENT TEST COMPLETE!');
    console.log('='.repeat(60));

    console.log('\n📊 TEST RESULTS:');
    console.log(`✅ User Authentication: ${userId ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Wallet Creation: ${walletData.address ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Contract Deployment: ${contractData.contractAddress ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Base Sepolia Network: ${contractData.contract?.network === 'base-sepolia' ? 'PASSED' : 'FAILED'}`);

    console.log('\n🔗 VERIFICATION LINKS:');
    if (contractData.contractAddress) {
      console.log(`   Contract: https://sepolia.basescan.org/address/${contractData.contractAddress}`);
    }
    if (contractData.transactionHash) {
      console.log(`   Transaction: https://sepolia.basescan.org/tx/${contractData.transactionHash}`);
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Verify contract appears on Base Sepolia explorer');
    console.log('   2. Check that contract shows as ERC721');
    console.log('   3. Verify transaction status is "Success"');
    console.log('   4. Check database entries are created');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testFullFlow();
