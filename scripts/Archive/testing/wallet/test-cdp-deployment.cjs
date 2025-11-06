#!/usr/bin/env node

/**
 * CDP ERC721 Deployment Test
 * Tests the CDP-only ERC721 deployment functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials from environment
const TEST_EMAIL = process.env.TEST_EMAIL || 'devdapp_test_2025oct15@mailinator.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

console.log('🚀 CDP ERC721 Deployment Test');
console.log('='.repeat(50));
console.log(`Using test email: ${TEST_EMAIL}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`App URL: ${APP_URL}`);

async function testDeployment() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Sign in with existing test user
    console.log('\n📝 Signing in with test user...');
    const { data: signinData, error: signinError } = await client.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signinError) {
      console.error('❌ Sign in failed:', signinError.message);
      console.log('💡 Creating test user first...');
      
      // Try to create the test user
      const { data: signupData, error: signupError } = await client.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signupError) {
        console.error('❌ User creation failed:', signupError.message);
        return;
      }

      console.log('✅ Test user created, now signing in...');
      
      // Wait a moment and try to sign in again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: retrySigninData, error: retrySigninError } = await client.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (retrySigninError) {
        console.error('❌ Retry sign in failed:', retrySigninError.message);
        return;
      }
      
      signinData = retrySigninData;
    }

    console.log('✅ Successfully signed in');
    
    // Check if user has any existing wallets
    console.log('\n💼 Checking existing wallets...');
    const { data: wallets, error: walletsError } = await client
      .from('user_wallets')
      .select('*')
      .eq('user_id', signinData.user.id);

    if (walletsError) {
      console.error('❌ Wallet query failed:', walletsError.message);
      return;
    }

    if (wallets && wallets.length > 0) {
      console.log(`✅ Found ${wallets.length} existing wallets`);
      const wallet = wallets[0];
      console.log(`Using wallet: ${wallet.wallet_address}`);
      
      // Test deployment
      await testContractDeployment(signinData.session.access_token, wallet);
    } else {
      console.log('❌ No wallets found. Creating wallet first...');
      
      // Create wallet first
      const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signinData.session.access_token}`,
        },
        body: JSON.stringify({
          name: 'CDP Test Wallet',
          type: 'custom',
        }),
      });

      if (!createWalletResponse.ok) {
        const errorData = await createWalletResponse.json();
        console.error('❌ Wallet creation failed:', errorData.error);
        return;
      }

      const walletData = await createWalletResponse.json();
      console.log('✅ Wallet created successfully!');
      console.log(`Wallet Address: ${walletData.address}`);
      
      // Test deployment
      await testContractDeployment(signinData.session.access_token, walletData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testContractDeployment(accessToken, wallet) {
  console.log('\n🚀 Testing ERC721 Deployment...');
  
  const deploymentResponse = await fetch(`${APP_URL}/api/contract/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: 'TestCDP',
      symbol: 'TCDP',
      maxSupply: 10000,
      mintPrice: '0',
      walletAddress: wallet.wallet_address || wallet.address,
    }),
  });

  if (!deploymentResponse.ok) {
    const errorData = await deploymentResponse.json();
    console.error('❌ Deployment failed:', errorData.error);
    console.error('Details:', errorData.details);
    return;
  }

  const deploymentData = await deploymentResponse.json();
  console.log('🎉 Deployment successful!');
  console.log(`Contract Address: ${deploymentData.contractAddress}`);
  console.log(`Transaction Hash: ${deploymentData.transactionHash}`);
  console.log(`Explorer URL: ${deploymentData.explorerUrl}`);
  console.log(`Network: ${deploymentData.contract.network}`);

  console.log('\n🎉 CDP ERC721 Deployment Test Complete!');
  console.log('='.repeat(50));
}

testDeployment();
