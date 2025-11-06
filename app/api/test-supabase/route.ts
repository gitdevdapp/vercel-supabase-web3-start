import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 🧪 TEST ENDPOINT: Insert test NFT and test RPC calls
 * 
 * GET /api/test-supabase?check=all&contract=0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E
 * 
 * POST /api/test-supabase with body:
 * {
 *   "action": "insert_nft",
 *   "contract": "0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E",
 *   "token_id": 1,
 *   "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 * }
 * 
 * or
 * 
 * {
 *   "action": "test_log_nft_mint",
 *   "token_id": 999,
 *   "contract_address": "0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contract, token_id, owner, contract_address } = body;

    const supabase = await createClient();

    if (action === 'insert_nft') {
      // Manually insert NFT for testing
      const { data, error } = await supabase
        .from('nft_tokens')
        .insert([
          {
            contract_address: contract,
            token_id: token_id || 1,
            owner_address: owner || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            minter_address: owner || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            token_uri: `${contract}/${token_id || 1}`,
            metadata_json: { token_id: token_id || 1 },
            is_burned: false,
            minted_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to insert NFT', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'insert_nft',
        data
      });
    }

    if (action === 'test_log_nft_mint') {
      // Test the RPC function directly
      const testContract = contract_address || '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E';
      const testTokenId = token_id || 999;
      
      const { data, error } = await supabase.rpc('log_nft_mint', {
        p_contract_address: testContract,
        p_token_id: testTokenId,
        p_owner_address: '0x1234567890123456789012345678901234567890',
        p_minter_address: '0x1234567890123456789012345678901234567890',
        p_minter_user_id: null,
        p_token_uri: null,
        p_metadata_json: null
      });

      return NextResponse.json({
        test: 'log_nft_mint RPC call',
        success: !error,
        contract: testContract,
        tokenId: testTokenId,
        data,
        error: error ? {
          message: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint
        } : null
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Diagnostic endpoint to check database state
 * GET /api/test-supabase?check=nfts&contract=0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const check = searchParams.get('check') || 'all';
    const contract = searchParams.get('contract') || '0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E';

    const results: any = {};

    if (check === 'all' || check === 'nfts') {
      // Check nft_tokens table
      const { data: nfts, error: nftsError, count } = await supabase
        .from('nft_tokens')
        .select('*', { count: 'exact' })
        .eq('contract_address', contract)
        .eq('is_burned', false);

      results.nfts = {
        error: nftsError?.message,
        count,
        sample: nfts?.slice(0, 3)
      };
    }

    if (check === 'all' || check === 'collection') {
      // Check smart_contracts
      const { data: collection, error: collectionError } = await supabase
        .from('smart_contracts')
        .select('*')
        .eq('contract_address', contract)
        .single();

      results.collection = {
        error: collectionError?.message,
        collection: collection ? {
          collection_slug: collection.collection_slug,
          total_minted: collection.total_minted,
          is_public: collection.is_public,
          marketplace_enabled: collection.marketplace_enabled,
          is_active: collection.is_active
        } : null
      };
    }

    if (check === 'all' || check === 'policies') {
      // Just describe the expected RLS policies
      results.policies = {
        message: 'RLS policies on nft_tokens table:',
        select: 'Requires: NOT is_burned AND collection is_public=true AND marketplace_enabled=true',
        insert: 'Requires: authenticated OR service_role'
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
