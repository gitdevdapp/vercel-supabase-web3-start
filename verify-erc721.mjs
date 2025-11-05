import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjrnzgunexmopvnamggw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcm56Z3VuZXhtb3B2bmFtZ2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODgyNywiZXhwIjoyMDczMjY0ODI3fQ.jYseGYwWnhXwEf_Yqs3O8AdTTNWVBMH94LE2qVi1DrA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 Querying smart_contracts table...\n');

// Query for ERC721 contracts
const { data, error, count } = await supabase
  .from('smart_contracts')
  .select('id, collection_name, collection_symbol, contract_address, contract_type, is_active, collection_slug, is_public, marketplace_enabled', { count: 'exact' })
  .eq('contract_type', 'ERC721')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.log('❌ Database Error:', error.message);
  process.exit(1);
} else {
  console.log(`✅ Found ${count} ERC721 Contracts in database\n`);
  
  if (data && data.length > 0) {
    console.log('📋 Sample Contracts:\n');
    data.slice(0, 5).forEach((c, i) => {
      console.log(`  [${i+1}] ${c.collection_name || c.contract_address.slice(0, 10)}`);
      console.log(`      Symbol: ${c.collection_symbol}`);
      console.log(`      Slug: ${c.collection_slug || '❌ NULL'}`);
      console.log(`      Public: ${c.is_public ? '✅' : '❌'} | Marketplace: ${c.marketplace_enabled ? '✅' : '❌'}`);
      console.log('');
    });
    
    // Check slug coverage
    const missingSlug = data.filter(c => !c.collection_slug).length;
    if (missingSlug > 0) {
      console.log(`⚠️  ${missingSlug}/${data.length} contracts missing slugs`);
    } else {
      console.log('✅ All contracts have collection slugs');
    }
  } else {
    console.log('⚠️  No ERC721 contracts found');
  }
}
