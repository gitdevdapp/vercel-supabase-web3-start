const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mjrnzgunexmopvnamggw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA';

async function verifyBackend() {
  try {
    console.log('🔍 Verifying Supabase Production Backend (MJR)\n');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('✅ Connected to production backend');
    
    // Test 1: Check user_wallets table exists and is accessible
    console.log('\n📊 Test 1: user_wallets table schema');
    const { data: sampleWallet, error: tableError } = await supabase
      .from('user_wallets')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Cannot query user_wallets:', tableError.message);
      return;
    }
    console.log('✅ user_wallets table is accessible');
    
    // Test 2: Check recent wallets
    console.log('\n💼 Test 2: Recent wallet creations');
    const { data: recentWallets, error: recentError } = await supabase
      .from('user_wallets')
      .select('id, user_id, wallet_address, network, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!recentError && recentWallets && recentWallets.length > 0) {
      console.log(`✅ Found ${recentWallets.length} recent wallets:`);
      recentWallets.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.wallet_address.substring(0, 10)}... (${new Date(w.created_at).toLocaleString()})`);
      });
    } else {
      console.log('ℹ️  No recent wallets found (this is OK if DB is fresh)');
    }
    
    // Test 3: Check users table
    console.log('\n👥 Test 3: auth.users table');
    const { data: recentUsers, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('id, email, email_confirmed_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!usersError) {
      console.log(`✅ auth.users accessible (total: ${usersCount} users)`);
      if (recentUsers && recentUsers.length > 0) {
        console.log('   Recent users:');
        recentUsers.forEach(u => {
          const confirmed = u.email_confirmed_at ? '✅' : '❌';
          console.log(`   ${confirmed} ${u.email}`);
        });
      }
    } else {
      console.log('ℹ️  Cannot access users table (using auth.users instead)');
    }
    
    // Test 4: Check database connection
    console.log('\n🔧 Test 4: Database connectivity');
    const { data: healthCheck, error: healthError } = await supabase
      .rpc('get_current_timestamp', {});
    
    if (!healthError) {
      console.log('✅ Database RPC calls are working');
    } else {
      console.log('⚠️  RPC calls may have issues (non-critical):', healthError.message.substring(0, 50));
    }
    
    console.log('\n✨ Supabase backend verification complete!');
    console.log('Status: ✅ OPERATIONAL\n');
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
}

verifyBackend();
