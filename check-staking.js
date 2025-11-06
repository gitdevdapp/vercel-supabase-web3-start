import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStaking() {
  try {
    // Test the calculate_rair_tokens function
    try {
      const { data: tokenCalc1, error: calcError1 } = await supabase.rpc('calculate_rair_tokens', { p_signup_order: 50 });
      console.log('calculate_rair_tokens(50):', tokenCalc1, calcError1);

      const { data: tokenCalc2, error: calcError2 } = await supabase.rpc('calculate_rair_tokens', { p_signup_order: 150 });
      console.log('calculate_rair_tokens(150):', tokenCalc2, calcError2);
    } catch (error) {
      console.log('Error testing calculate_rair_tokens:', error.message);
    }

    // Test the get_staking_status function
    try {
      const { data: status, error: statusError } = await supabase.rpc('get_staking_status');
      console.log('get_staking_status result:', status, statusError);
    } catch (error) {
      console.log('Error testing get_staking_status:', error.message);
    }

    // Manually fix the new user's staking data
    try {
      console.log('Manually fixing staking data for new user...');

      // Get the next signup order
      const { data: maxOrder } = await supabase
        .from('profiles')
        .select('signup_order')
        .not('signup_order', 'is', null)
        .order('signup_order', { ascending: false })
        .limit(1);

      const nextOrder = (maxOrder && maxOrder.length > 0) ? maxOrder[0].signup_order + 1 : 1;
      const tokens = nextOrder <= 100 ? 10000 : (nextOrder <= 500 ? 5000 : 2500);

      console.log(`Next signup order: ${nextOrder}, tokens: ${tokens}`);

      // Update the new user's profile
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({
          signup_order: nextOrder,
          rair_balance: tokens,
          rair_tokens_allocated: tokens,
          rair_token_tier: nextOrder <= 100 ? '1' : (nextOrder <= 500 ? '2' : '3')
        })
        .eq('email', 'stakingtest20251106@mailinator.com');

      console.log('Update result:', updateResult, updateError);

    } catch (error) {
      console.log('Error manually fixing staking data:', error.message);
    }

    // Check the profiles table for staking data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, rair_balance, rair_staked, signup_order, rair_token_tier, rair_tokens_allocated, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log('Recent profiles with staking data:');
    profiles.forEach(profile => {
      console.log(`Email: ${profile.email}`);
      console.log(`Created: ${profile.created_at}`);
      console.log(`RAIR Balance: ${profile.rair_balance}`);
      console.log(`RAIR Staked: ${profile.rair_staked}`);
      console.log(`Signup Order: ${profile.signup_order}`);
      console.log(`Token Tier: ${profile.rair_token_tier}`);
      console.log(`Tokens Allocated: ${profile.rair_tokens_allocated}`);
      console.log('---');
    });

    // Check staking transactions
    const { data: transactions, error: txError } = await supabase
      .from('staking_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (txError) {
      console.error('Error fetching transactions:', txError);
      return;
    }

    console.log('Recent staking transactions:');
    transactions.forEach(tx => {
      console.log(`User: ${tx.user_id}, Type: ${tx.transaction_type}, Amount: ${tx.amount}, Balance Before: ${tx.balance_before}, After: ${tx.balance_after}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStaking();
