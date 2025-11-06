import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 🔄 Manual Sync Endpoint: Sync total_minted counter from nft_tokens table
 * 
 * Use this to fix out-of-sync counters when RPC functions fail
 * Safe to call multiple times (idempotent)
 * 
 * Example: POST /api/sync/minted-counter?contract=0x2B4db673F1628b454b4dF45c7e2e4Cd17222594E
 * 
 * ⚠️ CURRENT ISSUE ON LOCALHOST:
 * RPC function log_nft_mint() is not inserting into nft_tokens table.
 * This endpoint syncs the counter from whatever IS in nft_tokens (currently 0).
 * 
 * FIX DEPLOYED TO PRODUCTION:
 * - Enhanced SQL script with proper service_role grants
 * - RLS policies configured for service_role INSERT access
 * - RPC functions have SECURITY DEFINER and proper search_path
 * 
 * TESTING FIX:
 * 1. Manually insert test NFT into nft_tokens table
 * 2. Call this endpoint to sync counter
 * 3. Counter should update to match nft_tokens count
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get contract address from query params (optional - if not provided, sync all)
    const searchParams = request.nextUrl.searchParams;
    const contractAddress = searchParams.get('contract');

    console.log('🔄 Starting minted counter sync...');

    if (contractAddress) {
      // Sync specific contract
      console.log(`📊 Syncing contract: ${contractAddress}`);
      
      // Count actual minted NFTs (not burned)
      const { count, error: countError } = await supabase
        .from('nft_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('contract_address', contractAddress)
        .eq('is_burned', false);

      if (countError) {
        return NextResponse.json(
          { error: 'Failed to count NFTs', details: countError.message },
          { status: 500 }
        );
      }

      // Update smart_contracts table with correct count
      const { error: updateError } = await supabase
        .from('smart_contracts')
        .update({ 
          total_minted: count || 0,
          updated_at: new Date().toISOString()
        })
        .eq('contract_address', contractAddress);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update counter', details: updateError.message },
          { status: 500 }
        );
      }

      console.log(`✅ Synced ${contractAddress}: ${count} NFTs`);

      return NextResponse.json({
        success: true,
        contract: contractAddress,
        synced_count: count,
        message: `Counter synced to ${count} NFTs`
      });
    } else {
      // Sync all public contracts
      console.log('📊 Syncing all public contracts...');

      const { data: contracts, error: contractsError } = await supabase
        .from('smart_contracts')
        .select('id, contract_address, collection_slug')
        .eq('is_public', true);

      if (contractsError) {
        return NextResponse.json(
          { error: 'Failed to fetch contracts', details: contractsError.message },
          { status: 500 }
        );
      }

      const results = [];

      for (const contract of contracts || []) {
        try {
          // Count NFTs for this contract
          const { count } = await supabase
            .from('nft_tokens')
            .select('*', { count: 'exact', head: true })
            .eq('contract_address', contract.contract_address)
            .eq('is_burned', false);

          // Update counter
          await supabase
            .from('smart_contracts')
            .update({ 
              total_minted: count || 0,
              updated_at: new Date().toISOString()
            })
            .eq('contract_address', contract.contract_address);

          results.push({
            contract_address: contract.contract_address,
            collection_slug: contract.collection_slug,
            synced_count: count || 0,
            status: 'success'
          });

          console.log(`✅ ${contract.collection_slug}: ${count || 0} NFTs`);
        } catch (err) {
          console.error(`❌ Failed to sync ${contract.collection_slug}:`, err);
          results.push({
            contract_address: contract.contract_address,
            collection_slug: contract.collection_slug,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      return NextResponse.json({
        success: true,
        total_synced: results.length,
        results,
        message: `Synced ${results.length} collections`
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync minted counter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
