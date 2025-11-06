import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function deepAnalysis() {
  console.log('\n=== DEEP WALLET ANALYSIS ===\n')
  
  // Test users from the most recent
  const testUsers = [
    { email: 'autowallet_nov3_1_@mailinator.com', id: '09c2d25a-9d6e-4155-b1e7-cc5e59f6c31e' },
    { email: 'test-autowallet-nov3-fix@mailinator.com', id: 'd00e8da1-906d-4bce-a998-293ac5f06e35' },
    { email: 'test-devdapp-autowallet-112325@mailinator.com', id: '8a44d829-0bdb-406b-b529-4a71820faa47' },
  ]
  
  for (const user of testUsers) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`👤 USER: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`${'='.repeat(60)}`)
    
    // Check wallets for this user
    const { data: wallets, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
    
    if (walletError) {
      console.log(`❌ Error querying wallets: ${walletError.message}`)
    } else {
      if (wallets.length === 0) {
        console.log(`⚠️  NO WALLETS FOUND for this user`)
      } else {
        console.log(`✅ Found ${wallets.length} wallet(s):`)
        wallets.forEach((w, idx) => {
          console.log(`\n   Wallet ${idx + 1}:`)
          console.log(`   - Address: ${w.wallet_address}`)
          console.log(`   - Name: ${w.wallet_name}`)
          console.log(`   - Network: ${w.network}`)
          console.log(`   - Active: ${w.is_active}`)
          console.log(`   - Platform API: ${w.platform_api_used}`)
          console.log(`   - Created: ${w.created_at}`)
          console.log(`   - ID: ${w.id}`)
        })
      }
    }
  }
  
  // Check table schema
  console.log(`\n\n${'='.repeat(60)}`)
  console.log('📊 TABLE SCHEMA ANALYSIS')
  console.log(`${'='.repeat(60)}`)
  
  // Try to get one wallet to see its full structure
  const { data: sampleWallet, error: sampleError } = await supabase
    .from('user_wallets')
    .select('*')
    .limit(1)
  
  if (sampleError) {
    console.log(`❌ Cannot access user_wallets: ${sampleError.message}`)
  } else {
    console.log(`✅ user_wallets table structure:`)
    if (sampleWallet.length > 0) {
      const keys = Object.keys(sampleWallet[0])
      keys.forEach(key => {
        const value = sampleWallet[0][key]
        console.log(`   - ${key}: ${typeof value} = ${value === null ? 'NULL' : value}`)
      })
    }
  }
  
  // Check if wallet_operations table exists
  console.log(`\n📋 Checking wallet_operations table...`)
  const { data: ops, error: opsError } = await supabase
    .from('wallet_operations')
    .select('*')
    .limit(1)
  
  if (opsError) {
    console.log(`❌ wallet_operations table NOT FOUND or not accessible`)
    console.log(`   Error: ${opsError.message}`)
  } else {
    console.log(`✅ wallet_operations table accessible`)
  }
  
  // Check for other tables
  console.log(`\n📋 Checking for related tables...`)
  const possibleTables = ['wallet_balances', 'faucet_requests', 'nft_deployments', 'nft_mints']
  
  for (const tableName of possibleTables) {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('Could not find the table')) {
      console.log(`   - ${tableName}: ❌ NOT FOUND`)
    } else if (error) {
      console.log(`   - ${tableName}: ⚠️  ${error.message}`)
    } else {
      console.log(`   - ${tableName}: ✅ EXISTS`)
    }
  }
  
}

deepAnalysis().catch(console.error)
