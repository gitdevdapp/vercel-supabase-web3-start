import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 🔐 Get Deployer Info Endpoint
 * 
 * Returns public information about the deployer wallet
 * - Address: Safe to expose (public blockchain data)
 * - Private Key: NEVER exposed - only used on server
 * 
 * This endpoint verifies authentication but doesn't require wallet ownership
 * since the deployer address is shared infrastructure
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION CHECK
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get deployer private key from environment
    const deployerPrivateKey = process.env.CDP_DEPLOYER_PRIVATE_KEY;
    if (!deployerPrivateKey) {
      return NextResponse.json(
        { 
          error: 'Deployer not configured',
          details: 'CDP_DEPLOYER_PRIVATE_KEY environment variable is not set'
        },
        { status: 503 }
      );
    }

    // Derive address from private key (ethers.js does this)
    // We'll use a simple wallet creation to get the address
    const { ethers } = await import('ethers');
    const wallet = new ethers.Wallet(deployerPrivateKey);
    const deployerAddress = wallet.address;

    return NextResponse.json({
      address: deployerAddress,
      network: 'base-sepolia',
      message: 'This is a shared deployer wallet for ERC721 contracts'
    });

  } catch (error) {
    console.error('Error getting deployer info:', error);
    return NextResponse.json(
      {
        error: 'Failed to get deployer information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
