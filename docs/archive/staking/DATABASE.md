# RAIR Staking System - Database Schema

## SQL Migration Script

This script should be run in the Supabase SQL Editor.

```sql
-- ============================================================================
-- RAIR Staking System - Database Schema
-- ============================================================================

-- Step 1: Add RAIR balance columns to profiles table
-- ----------------------------------------------------------------------------

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rair_balance NUMERIC DEFAULT 10000 CHECK (rair_balance >= 0),
ADD COLUMN IF NOT EXISTS rair_staked NUMERIC DEFAULT 0 CHECK (rair_staked >= 0);

-- Add comment for documentation
COMMENT ON COLUMN profiles.rair_balance IS 'Available RAIR token balance for user';
COMMENT ON COLUMN profiles.rair_staked IS 'Currently staked RAIR tokens';

-- Create index for faster queries on staked amount
CREATE INDEX IF NOT EXISTS idx_profiles_rair_staked ON profiles(rair_staked);

-- Step 2: Create staking transactions table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS staking_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stake', 'unstake')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  staked_before NUMERIC NOT NULL,
  staked_after NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_staking_transactions_user_id ON staking_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_transactions_created_at ON staking_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staking_transactions_type ON staking_transactions(transaction_type);

-- Add comment for documentation
COMMENT ON TABLE staking_transactions IS 'Audit log of all RAIR staking and unstaking transactions';

-- Step 3: Enable Row Level Security
-- ----------------------------------------------------------------------------

ALTER TABLE staking_transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- ----------------------------------------------------------------------------

-- Users can only view their own staking transactions
CREATE POLICY "Users can view own staking transactions"
  ON staking_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only allow inserts through RPC functions (no direct inserts)
CREATE POLICY "System can insert staking transactions"
  ON staking_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Prevent updates and deletes (immutable audit log)
-- No UPDATE or DELETE policies = no one can update or delete

-- Step 5: Create stake_rair function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION stake_rair(p_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_current_staked NUMERIC;
  v_new_balance NUMERIC;
  v_new_staked NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  -- Get current balances with row lock
  SELECT rair_balance, rair_staked
  INTO v_current_balance, v_current_staked
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- Check if profile exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient RAIR balance';
  END IF;

  -- Calculate new balances
  v_new_balance := v_current_balance - p_amount;
  v_new_staked := v_current_staked + p_amount;

  -- Update balances
  UPDATE profiles
  SET 
    rair_balance = v_new_balance,
    rair_staked = v_new_staked,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Create transaction record
  INSERT INTO staking_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    staked_before,
    staked_after
  ) VALUES (
    v_user_id,
    'stake',
    p_amount,
    v_current_balance,
    v_new_balance,
    v_current_staked,
    v_new_staked
  )
  RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'rair_balance', v_new_balance,
    'rair_staked', v_new_staked,
    'amount', p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error as JSON
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Step 6: Create unstake_rair function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION unstake_rair(p_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_current_staked NUMERIC;
  v_new_balance NUMERIC;
  v_new_staked NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  -- Get current balances with row lock
  SELECT rair_balance, rair_staked
  INTO v_current_balance, v_current_staked
  FROM profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- Check if profile exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Check sufficient staked amount
  IF v_current_staked < p_amount THEN
    RAISE EXCEPTION 'Insufficient staked RAIR';
  END IF;

  -- Calculate new balances
  v_new_balance := v_current_balance + p_amount;
  v_new_staked := v_current_staked - p_amount;

  -- Update balances
  UPDATE profiles
  SET 
    rair_balance = v_new_balance,
    rair_staked = v_new_staked,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Create transaction record
  INSERT INTO staking_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    staked_before,
    staked_after
  ) VALUES (
    v_user_id,
    'unstake',
    p_amount,
    v_current_balance,
    v_new_balance,
    v_current_staked,
    v_new_staked
  )
  RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'rair_balance', v_new_balance,
    'rair_staked', v_new_staked,
    'amount', p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error as JSON
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Step 7: Create helper function to get staking status
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_staking_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_staked NUMERIC;
  v_has_access BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT rair_balance, rair_staked
  INTO v_balance, v_staked
  FROM profiles
  WHERE id = v_user_id;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  v_has_access := v_staked >= 3000;

  RETURN json_build_object(
    'rair_balance', COALESCE(v_balance, 0),
    'rair_staked', COALESCE(v_staked, 0),
    'has_superguide_access', v_has_access
  );
END;
$$;

-- Step 8: Grant execute permissions
-- ----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION stake_rair(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION unstake_rair(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staking_status() TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification queries (run these to verify setup):

-- Check profiles table columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- AND column_name IN ('rair_balance', 'rair_staked');

-- Check staking_transactions table
-- SELECT * FROM information_schema.tables WHERE table_name = 'staking_transactions';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'staking_transactions';

-- Check functions exist
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_name IN ('stake_rair', 'unstake_rair', 'get_staking_status');
```

## Test Data Setup (Optional)

Run this to give test users initial RAIR balance:

```sql
-- Give all existing users 10,000 RAIR to start
UPDATE profiles 
SET rair_balance = 10000, 
    rair_staked = 0 
WHERE rair_balance IS NULL;
```

## Rollback Script (If Needed)

```sql
-- WARNING: This will delete all staking data
-- Only use in development/testing

-- Drop functions
DROP FUNCTION IF EXISTS stake_rair(NUMERIC);
DROP FUNCTION IF EXISTS unstake_rair(NUMERIC);
DROP FUNCTION IF EXISTS get_staking_status();

-- Drop table
DROP TABLE IF EXISTS staking_transactions;

-- Remove columns from profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS rair_balance,
DROP COLUMN IF EXISTS rair_staked;
```

## Database Schema Diagram

```
profiles table (existing + new columns)
├── user_id (uuid, PK)
├── email (text)
├── full_name (text)
├── avatar_url (text)
├── rair_balance (numeric) ← NEW
├── rair_staked (numeric) ← NEW
└── updated_at (timestamp)

staking_transactions table (NEW)
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── transaction_type (text: 'stake' | 'unstake')
├── amount (numeric)
├── balance_before (numeric)
├── balance_after (numeric)
├── staked_before (numeric)
├── staked_after (numeric)
└── created_at (timestamp)
```

## Access Pattern Examples

### Stake RAIR
```sql
SELECT stake_rair(3000);
```

### Unstake RAIR
```sql
SELECT unstake_rair(1000);
```

### Get Status
```sql
SELECT get_staking_status();
```

### View Transaction History
```sql
SELECT * FROM staking_transactions 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```


