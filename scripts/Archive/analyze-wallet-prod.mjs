import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mjrnzgunexmopvnamggw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function analyzeWalletSystem() {
  console.log('\n=== SUPABASE MJR WALLET SYSTEM ANALYSIS ===\n')
  
  try {
    // 1. Check existing wallets
    console.log('📋 1. EXISTING WALLETS IN SUPABASE')
    console.log('=' . repeat(50))
    const { data: wallets, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (walletError) {
      console.log('❌ ERROR fetching wallets:', walletError.message)
    } else {
      console.log(`✅ Total wallets in database: ${wallets.length}`)
      if (wallets.length > 0) {
        console.log('\nWallet Details:')
        wallets.forEach((w, idx) => {
          console.log(`\n${idx + 1}. Wallet ID: ${w.id}`)
          console.log(`   User ID: ${w.user_id}`)
          console.log(`   Address: ${w.wallet_address}`)
          console.log(`   Name: ${w.wallet_name}`)
          console.log(`   Network: ${w.network}`)
          console.log(`   Active: ${w.is_active}`)
          console.log(`   Platform API: ${w.platform_api_used}`)
          console.log(`   Created: ${w.created_at}`)
        })
      }
    }
    
    // 2. Check wallet_operations logs
    console.log('\n\n📊 2. WALLET OPERATION LOGS')
    console.log('=' . repeat(50))
    const { data: ops, error: opsError } = await supabase
      .from('wallet_operations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (opsError) {
      console.log('❌ ERROR fetching wallet operations:', opsError.message)
    } else {
      console.log(`✅ Total operations logged: ${ops.length}`)
      if (ops.length > 0) {
        console.log('\nOperation Details:')
        ops.forEach((op, idx) => {
          console.log(`\n${idx + 1}. Operation Type: ${op.p_operation_type}`)
          console.log(`   User ID: ${op.p_user_id}`)
          console.log(`   Wallet ID: ${op.p_wallet_id}`)
          console.log(`   Status: ${op.p_status}`)
          console.log(`   Token Type: ${op.p_token_type}`)
          console.log(`   Created: ${op.created_at}`)
        })
      }
    }
    
    // 3. Check auth users
    console.log('\n\n👥 3. AUTHENTICATED USERS')
    console.log('=' . repeat(50))
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log('❌ ERROR fetching users:', authError)
    } else {
      console.log(`✅ Total users: ${users.length}`)
      console.log('\nUser Details:')
      users.forEach((u, idx) => {
        console.log(`\n${idx + 1}. Email: ${u.email}`)
        console.log(`   ID: ${u.id}`)
        console.log(`   Created: ${u.created_at}`)
        console.log(`   Last Sign-In: ${u.last_sign_in_at}`)
      })
    }
    
  } catch (err) {
    console.error('❌ FATAL ERROR:', err.message)
    console.error(err.stack)
  }
}

analyzeWalletSystem()
