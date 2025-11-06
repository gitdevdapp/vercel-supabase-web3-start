#!/usr/bin/env node

/**
 * Browser-like CDP Test
 * Simulates browser authentication and tests CDP functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123';

console.log('🌐 BROWSER-SIMULATED CDP TEST');
console.log('='.repeat(50));

async function testWithProperAuth() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Sign in to get session
    console.log('📝 Getting authentication session...');
    const { data: signinData, error: signinError } = await client.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signinError) {
      console.error('❌ Sign in failed:', signinError.message);
      return;
    }

    console.log('✅ Authentication successful');
    const accessToken = signinData.session.access_token;
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   User ID: ${signinData.user.id}`);

    // Get session cookies (simulate browser)
    const cookies = client.auth.session()?.access_token 
      ? `sb-access-token=${signinData.session.access_token};`
      : '';
    
    console.log(`   Session Cookie: ${cookies.substring(0, 30)}...`);

    // Test wallet creation with proper headers (simulating browser request)
    console.log('\n💰 Testing wallet creation with session...');
    const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Browser Test Wallet',
        type: 'custom',
      }),
    });

    console.log(`   Response Status: ${createWalletResponse.status}`);
    const walletResponseText = await createWalletResponse.text();
    
    if (!createWalletResponse.ok) {
      console.error('❌ Wallet creation failed');
      console.error('   Response:', walletResponseText);
      return;
    }

    const walletData = JSON.parse(walletResponseText);
    console.log('✅ Wallet created successfully!');
    console.log(`   Address: ${walletData.address}`);
    console.log(`   Name: ${walletData.name}`);

    // Test contract deployment
    console.log('\n🚀 Testing ERC721 deployment...');
    const deploymentResponse = await fetch(`${APP_URL}/api/contract/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'BrowserTestNFT',
        symbol: 'BTNFT',
        maxSupply: 10000,
        mintPrice: '0',
        walletAddress: walletData.address,
      }),
    });

    console.log(`   Response Status: ${deploymentResponse.status}`);
    const deploymentResponseText = await deploymentResponse.text();
    
    if (!deploymentResponse.ok) {
      console.error('❌ Contract deployment failed');
      console.error('   Response:', deploymentResponseText);
      return;
    }

    const contractData = JSON.parse(deploymentResponseText);
    console.log('🎉 Contract deployment successful!');
    console.log(`   Contract Address: ${contractData.contractAddress}`);
    console.log(`   Transaction Hash: ${contractData.transactionHash}`);
    console.log(`   Explorer URL: ${contractData.explorerUrl}`);
    console.log(`   Network: ${contractData.contract.network}`);

    // Verify on Base Sepolia
    if (contractData.transactionHash) {
      console.log('\n🌐 Verifying on Base Sepolia...');
      console.log(`   Transaction: https://sepolia.basescan.org/tx/${contractData.transactionHash}`);
      console.log(`   Contract: https://sepolia.basescan.org/address/${contractData.contractAddress}`);
      
      // Wait for confirmation
      console.log('   ⏳ Waiting 15 seconds for blockchain confirmation...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      console.log('   ✅ Transaction should now be visible on Base Sepolia');
      console.log('   📋 Please verify manually at the explorer links above');
    }

    console.log('\n🎉 BROWSER-SIMULATED TEST COMPLETE!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

testWithProperAuth();
