import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: 'public' }
})

async function checkSchema() {
  console.log('\n=== DETAILED SCHEMA & RLS ANALYSIS ===\n')
  
  // Get all columns from user_wallets
  console.log('📋 USER_WALLETS TABLE COLUMNS:')
  console.log('=' .repeat(60))
  
  const { data: wallets } = await supabase
    .from('user_wallets')
    .select('*')
    .limit(1)
  
  if (wallets && wallets.length > 0) {
    const sample = wallets[0]
    Object.entries(sample).forEach(([key, value]) => {
      console.log(`  - ${key}: ${typeof value}`)
    })
    
    // Check if platform_api_used column exists
    if ('platform_api_used' in sample) {
      console.log(`\n  ✅ platform_api_used column EXISTS (value: ${sample.platform_api_used})`)
    } else {
      console.log(`\n  ❌ platform_api_used column MISSING`)
    }
  }
  
  // Try to insert a test wallet with RLS bypass (service role)
  console.log('\n\n🔐 RLS & INSERT TEST:')
  console.log('=' . repeat(60))
  
  const testUserId = 'test-rls-check-' + Date.now()
  const testWalletAddress = '0xTestRLSCheck' + Date.now().toString().slice(-8)
  
  console.log(`\nAttempting test insert with Service Role (should work):`)
  console.log(`  User ID: ${testUserId}`)
  console.log(`  Wallet: ${testWalletAddress}`)
  
  const { data: testInsert, error: testError } = await supabase
    .from('user_wallets')
    .insert({
      user_id: testUserId,
      wallet_address: testWalletAddress,
      wallet_name: 'RLS Test Wallet',
      network: 'base-sepolia',
      is_active: true,
      platform_api_used: true
    })
    .select()
    .single()
  
  if (testError) {
    console.log(`❌ INSERT FAILED: ${testError.message}`)
    console.log(`   Code: ${testError.code}`)
  } else {
    console.log(`✅ INSERT SUCCEEDED`)
    console.log(`   Wallet ID: ${testInsert.id}`)
    
    // Clean up test data
    await supabase
      .from('user_wallets')
      .delete()
      .eq('id', testInsert.id)
    console.log(`   (Test data cleaned up)`)
  }
  
  // Check for auth.users table existence
  console.log('\n\n👥 AUTH USERS TABLE CHECK:')
  console.log('=' . repeat(60))
  
  try {
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1)
    
    if (authError) {
      console.log(`❌ Cannot query auth.users: ${authError.message}`)
    } else {
      console.log(`✅ auth.users table accessible`)
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`)
  }
  
  // Check profiles table if it exists
  console.log('\n\n📝 CHECKING OTHER TABLES:')
  console.log('=' . repeat(60))
  
  const possibleTables = ['profiles', 'users', 'user_profiles']
  for (const table of possibleTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('Could not find')) {
      console.log(`  - ${table}: ❌ NOT FOUND`)
    } else if (error) {
      console.log(`  - ${table}: ⚠️  ${error.message.substring(0, 50)}...`)
    } else {
      console.log(`  - ${table}: ✅ EXISTS (${data.length} rows)`)
    }
  }
  
}

checkSchema().catch(console.error)
