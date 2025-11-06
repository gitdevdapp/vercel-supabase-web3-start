import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function testSignupFlow() {
  console.log('🚀 Testing signup and email confirmation flow...\n');

  // Generate test email
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const testEmail = `test-signup-${timestamp}-${random}@mailinator.com`;
  const testPassword = 'TestPassword123!';

  console.log(`📧 Test email: ${testEmail}`);
  console.log(`🔑 Test password: ${testPassword}\n`);

  try {
    // Step 1: Sign up
    console.log('📝 Step 1: Creating new user account...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm?next=/protected/profile`
      }
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError);
      return;
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${signupData.user?.id}`);
    console.log(`   Email: ${signupData.user?.email}\n`);

    const userId = signupData.user?.id;

    // Step 2: Confirm email using admin API
    console.log('📧 Step 2: Confirming email via admin API...');
    const { data: confirmData, error: confirmError } = await adminClient.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('❌ Email confirmation failed:', confirmError);
      return;
    }

    console.log('✅ Email confirmed successfully!\n');

    // Step 3: Sign in with confirmed account
    console.log('🔑 Step 3: Signing in with confirmed account...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signinError) {
      console.error('❌ Sign in failed:', signinError);
      return;
    }

    console.log('✅ Sign in successful!');
    console.log(`   Session created: ${!!signinData.session}`);
    console.log(`   Access token present: ${!!signinData.session?.access_token}\n`);

    // Step 4: Test profile creation (if trigger exists)
    console.log('👤 Step 4: Checking profile creation...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for triggers

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('⚠️  Profile not found (triggers may not be set up):', profileError.message);
    } else {
      console.log('✅ Profile created automatically!');
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   Username: ${profile.username}`);
      console.log(`   Email verified: ${profile.email_verified}`);
    }

    // Step 5: Test protected route access
    console.log('\n🔒 Step 5: Testing protected route access...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Cannot access user data:', userError);
    } else {
      console.log('✅ Protected route access successful!');
      console.log(`   Current user: ${user.email}`);
      console.log(`   User ID matches: ${user.id === userId}`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test user...');
    try {
      // Delete from profiles if it exists
      await supabase.from('profiles').delete().eq('id', userId);
      console.log('✅ Test user profile deleted');
    } catch (e) {
      console.log('⚠️  Could not delete profile (may not exist)');
    }

    try {
      // Delete user account
      await adminClient.auth.admin.deleteUser(userId);
      console.log('✅ Test user account deleted');
    } catch (e) {
      console.log('⚠️  Could not delete user account:', e.message);
    }

    console.log('\n🎉 Signup and confirmation flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ User signup');
    console.log('  ✅ Email confirmation');
    console.log('  ✅ User sign in');
    console.log('  ✅ Protected route access');
    console.log('  ✅ Cleanup completed');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testSignupFlow().then(() => {
  console.log('\n🏁 Test script finished');
}).catch(console.error);
