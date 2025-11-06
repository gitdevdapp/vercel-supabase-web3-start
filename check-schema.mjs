import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const serviceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 Checking smart_contracts schema...\n');

// Get any contract to see its structure
const { data, error } = await supabase
  .from('smart_contracts')
  .select('*')
  .limit(1);

if (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}

if (data && data.length > 0) {
  console.log('📋 Existing columns in smart_contracts table:\n');
  const contract = data[0];
  Object.keys(contract).forEach(key => {
    const value = contract[key];
    const type = typeof value === 'object' ? 'JSONB' : typeof value === 'number' ? 'NUMERIC' : 'TEXT/TIMESTAMP';
    console.log(`  ✓ ${key}: ${type}`);
  });
  
  console.log('\n🔎 Missing columns for NFT collections feature:');
  const requiredCols = ['collection_slug', 'collection_name', 'collection_symbol', 'max_supply', 'mint_price_wei', 'collection_image_url', 'collection_description', 'is_public', 'marketplace_enabled'];
  const existingCols = Object.keys(contract);
  requiredCols.forEach(col => {
    if (!existingCols.includes(col)) {
      console.log(`  ❌ ${col}`);
    } else {
      console.log(`  ✅ ${col}`);
    }
  });
}
