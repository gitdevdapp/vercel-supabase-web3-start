import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function finalAnalysis() {
  console.log('\n=== FINAL WALLET SYSTEM ANALYSIS ===\n')
  
  console.log('1️⃣  WALLET DATA STATISTICS')
  console.log('=' .repeat(60))
  
  // Count total wallets
  const { data: allWallets } = await supabase
    .from('user_wallets')
    .select('id', { count: 'exact' })
  
  console.log(`   Total wallets in database: ${allWallets ? allWallets.length : 0}`)
  
  // Count recent wallets (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentWallets } = await supabase
    .from('user_wallets')
    .select('*')
    .gte('created_at', sevenDaysAgo)
  
  console.log(`   Wallets created in last 7 days: ${recentWallets ? recentWallets.length : 0}`)
  
  // Count users with wallets
  const uniqueUserIds = new Set(allWallets?.map(w => w.user_id) || [])
  console.log(`   Unique users with wallets: ${uniqueUserIds.size}`)
  
  // Check if any recent wallet has platform_api_used=true (would fail now)
  const { data: platformWallets } = await supabase
    .from('user_wallets')
    .select('platform_api_used')
    .gte('created_at', sevenDaysAgo)
  
  console.log(`   Recent wallets marked as platform_api_used: ${platformWallets?.filter(w => w.platform_api_used).length || 0}`)
  
  console.log('\n\n2️⃣  DATABASE SCHEMA ISSUES')
  console.log('=' .repeat(60))
  
  // Test what columns the insert is failing on
  console.log('\n   Testing inserts with different column sets:\n')
  
  // Test 1: Insert without platform_api_used
  const testUser1 = 'test-' + Date.now()
  const testAddr1 = '0xTest' + Date.now().toString().slice(-12)
  
  const { error: err1 } = await supabase
    .from('user_wallets')
    .insert({
      user_id: testUser1,
      wallet_address: testAddr1,
      wallet_name: 'Test 1',
      network: 'base-sepolia',
      is_active: true
      // NO platform_api_used
    })
    .select()
  
  if (err1) {
    console.log(`   ❌ Insert WITHOUT platform_api_used column:`)
    console.log(`      Error: ${err1.message}`)
  } else {
    console.log(`   ✅ Insert WITHOUT platform_api_used column: SUCCESS`)
    // Clean up
    await supabase.from('user_wallets').delete().eq('user_id', testUser1)
  }
  
  // Test 2: Insert with platform_api_used
  const testUser2 = 'test-' + (Date.now() + 1)
  const testAddr2 = '0xTest' + (Date.now() + 1).toString().slice(-12)
  
  const { error: err2 } = await supabase
    .from('user_wallets')
    .insert({
      user_id: testUser2,
      wallet_address: testAddr2,
      wallet_name: 'Test 2',
      network: 'base-sepolia',
      is_active: true,
      platform_api_used: true
      // WITH platform_api_used
    })
    .select()
  
  if (err2) {
    console.log(`\n   ❌ Insert WITH platform_api_used column:`)
    console.log(`      Error: ${err2.message}`)
    console.log(`      Code: ${err2.code}`)
  } else {
    console.log(`\n   ✅ Insert WITH platform_api_used column: SUCCESS`)
    // Clean up
    await supabase.from('user_wallets').delete().eq('user_id', testUser2)
  }
  
  console.log('\n\n3️⃣  RPC FUNCTIONS STATUS')
  console.log('=' .repeat(60))
  
  // Check if log_wallet_operation RPC exists
  console.log(`   Checking for log_wallet_operation RPC...`)
  try {
    const { error: rpcError } = await supabase.rpc('log_wallet_operation', {
      p_user_id: 'test',
      p_wallet_id: 'test',
      p_operation_type: 'test',
      p_status: 'test'
    })
    if (rpcError && rpcError.message.includes('Could not find the')) {
      console.log(`   ❌ RPC log_wallet_operation DOES NOT EXIST`)
    } else if (rpcError) {
      console.log(`   ⚠️  RPC exists but error: ${rpcError.message}`)
    }
  } catch (e) {
    console.log(`   ❌ RPC call failed: ${e.message}`)
  }
  
  // Check if log_contract_deployment RPC exists
  console.log(`\n   Checking for log_contract_deployment RPC...`)
  try {
    const { error: rpcError } = await supabase.rpc('log_contract_deployment', {
      p_user_id: 'test',
      p_wallet_id: 'test',
      p_contract_address: 'test',
      p_tx_hash: 'test'
    })
    if (rpcError && rpcError.message.includes('Could not find the')) {
      console.log(`   ❌ RPC log_contract_deployment DOES NOT EXIST`)
    } else if (rpcError) {
      console.log(`   ⚠️  RPC exists but error: ${rpcError.message}`)
    }
  } catch (e) {
    console.log(`   ❌ RPC call failed: ${e.message}`)
  }
  
  console.log('\n\n4️⃣  ATTEMPTED AUTO-CREATE ANALYSIS')
  console.log('=' .repeat(60))
  
  const recentTestUsers = [
    'autowallet_nov3_1_@mailinator.com',
    'test-autowallet-nov3-fix@mailinator.com',
    'test-devdapp-autowallet-112325@mailinator.com'
  ]
  
  console.log(`\n   Recent test users (Nov 3, 2025) - None have wallets:`)
  recentTestUsers.forEach(email => {
    console.log(`   - ${email}: ❌ No wallet created`)
  })
  
  console.log(`\n   Analysis: These users likely attempted wallet creation but`)
  console.log(`   failed due to the platform_api_used column being missing.`)
}

finalAnalysis().catch(console.error)
