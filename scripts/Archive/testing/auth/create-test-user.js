#!/usr/bin/env node

// Create a test user with pre-confirmed email
// Usage: node scripts/testing/create-test-user.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Check your .env.local file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  const testEmail = 'test@test.com';
  const testPassword = 'test123';

  console.log('🔧 Creating test user...');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('');

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);

    if (existingUser) {
      console.log('⚠️  User already exists');
      console.log('🗑️  Deleting existing user...');
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      console.log('✅ Existing user deleted');
    }

    // Create user with admin API (automatically confirmed)
    console.log('👤 Creating new user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Test User'
      }
    });

    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      process.exit(1);
    }

    console.log('✅ User created successfully!');
    console.log('');
    console.log('━'.repeat(60));
    console.log('📋 LOGIN CREDENTIALS');
    console.log('━'.repeat(60));
    console.log('Email:    test@test.com');
    console.log('Password: test123');
    console.log('User ID:  ' + newUser.user.id);
    console.log('━'.repeat(60));
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/auth/login');
    console.log('');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createTestUser();

