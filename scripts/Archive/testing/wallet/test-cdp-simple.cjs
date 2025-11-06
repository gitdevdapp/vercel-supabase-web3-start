#!/usr/bin/env node

/**
 * Simple CDP Wallet Creation Test
 * Tests wallet creation and CDP integration
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test credentials from environment
const TEST_EMAIL = process.env.TEST_EMAIL || 'devdapp_test_2025oct15@mailinator.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

console.log('🔧 CDP Simple Wallet Test');
console.log('='.repeat(50));
console.log(`Using test email: ${TEST_EMAIL}`);
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`App URL: ${APP_URL}`);

async function testWalletCreation() {
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
      return;
    }

    console.log('✅ Successfully signed in');
    
    // Create wallet
    console.log('\n💰 Creating wallet...');
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
    console.log(`Wallet Name: ${walletData.name}`);

    // List wallets to verify
    console.log('\n📋 Listing wallets...');
    const listWalletsResponse = await fetch(`${APP_URL}/api/wallet/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${signinData.session.access_token}`,
      },
    });

    if (!listWalletsResponse.ok) {
      const errorData = await listWalletsResponse.json();
      console.error('❌ Wallet list failed:', errorData.error);
      return;
    }

    const walletsData = await listWalletsResponse.json();
    console.log('✅ Wallet list retrieved');
    console.log(`Found ${walletsData.wallets?.length || 0} wallets`);
    
    if (walletsData.wallets && walletsData.wallets.length > 0) {
      const wallet = walletsData.wallets[0];
      console.log(`ETH Balance: ${wallet.balances?.eth || 0}`);
      console.log(`USDC Balance: ${wallet.balances?.usdc || 0}`);
    }

    console.log('\n🎉 CDP Integration Test Complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWalletCreation();
