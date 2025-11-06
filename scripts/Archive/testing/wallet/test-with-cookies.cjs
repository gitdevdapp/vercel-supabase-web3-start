#!/usr/bin/env node

/**
 * CDP Test with Proper Cookie Authentication
 * Simulates browser authentication context with cookies
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123';

console.log('🍪 CDP TEST WITH PROPER COOKIE AUTHENTICATION');
console.log('='.repeat(50));

async function testWithCookies() {
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Sign in to get session
    console.log('📝 Step 1: Getting session...');
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
    const refreshToken = signinData.session.refresh_token;

    // Create cookie string (simulating browser)
    const cookies = [
      `sb-${SUPABASE_URL.replace('https://', '').split('.')[0]}-auth-token=${accessToken}`,
      `sb-${SUPABASE_URL.replace('https://', '').split('.')[0]}-auth-token.1=${refreshToken}`
    ].join('; ');

    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Cookies: ${cookies.substring(0, 50)}...`);

    // Test wallet creation with cookies (simulating browser request)
    console.log('\n💰 Step 2: Wallet Creation with Cookies');
    const createWalletResponse = await fetch(`${APP_URL}/api/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        name: 'Cookie Test Wallet',
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

    // Wait a moment for wallet processing
    console.log('   ⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test contract deployment with cookies
    console.log('\n🚀 Step 3: ERC721 Deployment with Cookies');
    const deploymentResponse = await fetch(`${APP_URL}/api/contract/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        name: 'CookieTestNFT',
        symbol: 'CTNFT',
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
    console.log(`   Network: ${contractData.contract?.network}`);

    // Verify deployment
    if (contractData.contractAddress && contractData.transactionHash) {
      console.log('\n✅ VERIFICATION SUCCESS:');
      console.log(`   - Valid contract address: ${contractData.contractAddress.match(/^0x[a-fA-F0-9]{40}$/) ? '✅' : '❌'}`);
      console.log(`   - Valid transaction hash: ${contractData.transactionHash.match(/^0x[a-fA-F0-9]{64}$/) ? '✅' : '❌'}`);
      console.log(`   - Correct network: ${contractData.contract?.network === 'base-sepolia' ? '✅' : '❌'}`);
      
      console.log('\n🌐 BASE SEPOLIA EXPLORER:');
      console.log(`   https://sepolia.basescan.org/tx/${contractData.transactionHash}`);
      console.log(`   https://sepolia.basescan.org/address/${contractData.contractAddress}`);
      
      // Wait for blockchain confirmation
      console.log('\n⏳ Waiting 20 seconds for blockchain confirmation...');
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      console.log('✅ Blockchain confirmation period complete');
      console.log('📋 Verify transaction on Base Sepolia explorer');
    }

    console.log('\n🎉 COOKIE AUTHENTICATION TEST COMPLETE!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

testWithCookies();
