const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mjrnzgunexmopvnamggw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA';

async function checkWallet() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get wallets created in last 10 minutes
    const { data: wallets } = await supabase
      .from('user_wallets')
      .select('id, user_id, wallet_address, wallet_name, network, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (wallets && wallets.length > 0) {
      console.log('\n📊 Recent wallets (last 10):');
      wallets.forEach((w, i) => {
        console.log(`${i+1}. ${w.wallet_address.substring(0, 15)}... (${new Date(w.created_at).toLocaleString()})`);
      });
    } else {
      console.log('No wallets found');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkWallet();
