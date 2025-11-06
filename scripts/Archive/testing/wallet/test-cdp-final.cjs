#!/usr/bin/env node

/**
 * Final CDP ERC721 Deployment Test
 * Tests the complete flow with proper authentication
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123';

console.log('🚀 FINAL CDP ERC721 DEPLOYMENT TEST');
console.log('='.repeat(50));

async function testCDPDeployment() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    let sessionData = null;

    // Sign in to get session
    console.log('📝 Step 1: Authentication');
    const { data: signinData, error: signinError } = await client.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signinError) {
      console.error('❌ Sign in failed:', signinError.message);
      return;
    }

    console.log('✅ Authentication successful');
    console.log(`   User ID: ${signinData.user.id}`);
    
    sessionData = signinData.session;
    const accessToken = sessionData.access_token;
    
    // Test wallet creation with Bearer token (most common auth method)
    console.log('\n💰 Step 2: Wallet Creation');
    const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Final Test Wallet',
        type: 'custom',
      }),
    });

    console.log(`   Response Status: ${createWalletResponse.status}`);
    
    if (!createWalletResponse.ok) {
      const errorData = await createWalletResponse.json().catch(() => ({}));
      console.error('❌ Wallet creation failed:', errorData.error || 'Unknown error');
      return;
    }

    const walletData = await createWalletResponse.json();
    console.log('✅ Wallet created successfully!');
    console.log(`   Address: ${walletData.address}`);
    console.log(`   Name: ${walletData.name}`);

    // Test contract deployment
    console.log('\n🚀 Step 3: ERC721 Contract Deployment');
    const deploymentResponse = await fetch(`${APP_URL}/api/contract/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'FinalTestNFT',
        symbol: 'FTNFT',
        maxSupply: 10000,
        mintPrice: '0',
        walletAddress: walletData.address,
      }),
    });

    console.log(`   Response Status: ${deploymentResponse.status}`);
    
    if (!deploymentResponse.ok) {
      const errorData = await deploymentResponse.json().catch(() => ({}));
      console.error('❌ Contract deployment failed:', errorData.error || 'Unknown error');
      if (errorData.details) {
        console.error('   Details:', errorData.details);
      }
      return;
    }

    const contractData = await deploymentResponse.json();
    console.log('🎉 Contract deployment successful!');
    console.log(`   Contract Address: ${contractData.contractAddress}`);
    console.log(`   Transaction Hash: ${contractData.transactionHash}`);
    console.log(`   Explorer URL: ${contractData.explorerUrl}`);
    console.log(`   Network: ${contractData.contract?.network}`);

    // Verify deployment details
    console.log('\n🔍 Step 4: Deployment Verification');
    if (contractData.contractAddress && contractData.transactionHash) {
      console.log('✅ All deployment data received');
      
      // Check network
      if (contractData.contract?.network === 'base-sepolia') {
        console.log('✅ Correct network: Base Sepolia');
      } else {
        console.log('⚠️  Unexpected network:', contractData.contract?.network);
      }

      // Verify contract address format
      if (contractData.contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('✅ Valid contract address format');
      } else {
        console.log('⚠️  Invalid contract address format');
      }

      // Verify transaction hash format
      if (contractData.transactionHash.match(/^0x[a-fA-F0-9]{64}$/)) {
        console.log('✅ Valid transaction hash format');
      } else {
        console.log('⚠️  Invalid transaction hash format');
      }

      // Base Sepolia explorer links
      console.log('\n🔗 Base Sepolia Explorer Links:');
      console.log(`   Transaction: https://sepolia.basescan.org/tx/${contractData.transactionHash}`);
      console.log(`   Contract: https://sepolia.basescan.org/address/${contractData.contractAddress}`);

      // Wait for blockchain confirmation
      console.log('\n⏳ Waiting 20 seconds for blockchain confirmation...');
      await new Promise(resolve => setTimeout(resolve, 20000));

      console.log('✅ Blockchain confirmation period complete');
      console.log('📋 Please verify the transaction on Base Sepolia explorer');

      // Final verification
      console.log('\n🎯 FINAL VERIFICATION:');
      console.log(`   - Contract Address: ${contractData.contractAddress}`);
      console.log(`   - Transaction Hash: ${contractData.transactionHash}`);
      console.log(`   - Network: ${contractData.contract?.network}`);
      console.log(`   - Explorer: https://sepolia.basescan.org/tx/${contractData.transactionHash}`);

    } else {
      console.log('⚠️  Missing deployment data');
    }

    console.log('\n🎉 CDP ERC721 DEPLOYMENT TEST COMPLETE!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testCDPDeployment();
