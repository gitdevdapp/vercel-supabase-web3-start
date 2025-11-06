import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { AbiCoder } from "ethers";

const verifyContractSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  name: z.string().min(1, "Contract name is required"),
  symbol: z.string().min(1, "Contract symbol is required"),
  maxSupply: z.number().int().positive("Max supply must be positive"),
  mintPrice: z.string().regex(/^\d+$/, "Mint price must be a valid number string"),
  baseURI: z.string().url("Base URI must be a valid URL").default("https://example.com/metadata/")
});

interface VerifyContractRequest {
  contractAddress: string;
  name: string;
  symbol: string;
  maxSupply: number;
  mintPrice: string;
  baseURI?: string;
}

interface EtherscanVerifyResponse {
  status: string;
  message: string;
  result?: string;
}

/**
 * Verify contract on Etherscan using hardhat plugin
 * This endpoint triggers the Hardhat verify command server-side
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = verifyContractSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { contractAddress, name, symbol, maxSupply, mintPrice, baseURI } = validation.data;

    // Verify contract exists in database and user owns it
    const { data: contract, error: contractError } = await supabase
      .from('smart_contracts')
      .select('*')
      .eq('contract_address', contractAddress)
      .eq('user_id', user.id)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log(`🔍 Attempting contract verification for ${contractAddress}...`);

    // Check current verification status via Etherscan API
    const statusCheckUrl = new URL("https://api.etherscan.io/v2/api");
    statusCheckUrl.searchParams.set("chainid", "84532"); // Base Sepolia
    statusCheckUrl.searchParams.set("module", "contract");
    statusCheckUrl.searchParams.set("action", "getsourcecode");
    statusCheckUrl.searchParams.set("address", contractAddress);
    statusCheckUrl.searchParams.set("apikey", process.env.ETHERSCAN_API_KEY || "");

    const statusResponse = await fetch(statusCheckUrl.toString());
    const statusData = (await statusResponse.json()) as EtherscanVerifyResponse;

    // If already verified, update database and return success
    if (statusData.result && Array.isArray(statusData.result) && statusData.result[0]?.SourceCode && statusData.result[0].SourceCode !== '') {
      console.log(`✅ Contract already verified on Etherscan`);
      
      await supabase
        .from('smart_contracts')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          verification_status: 'verified',
          verification_attempts: (contract.verification_attempts || 0) + 1
        })
        .eq('id', contract.id);

      return NextResponse.json({
        success: true,
        message: 'Contract already verified on Etherscan',
        verified: true,
        contractAddress,
        explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}#code`
      });
    }

    // Attempt verification via Etherscan API directly
    console.log(`📤 Submitting verification request to Etherscan...`);
    
    try {
      const verifyResult = await verifyViaEtherscan(
        contractAddress,
        name,
        symbol,
        maxSupply,
        mintPrice,
        baseURI || "https://example.com/metadata/"
      );

      if (verifyResult.success) {
        // Update database
        await supabase
          .from('smart_contracts')
          .update({
            verified: true,
            verified_at: new Date().toISOString(),
            verification_status: 'verified',
            verification_attempts: (contract.verification_attempts || 0) + 1,
            verification_error: null,
            constructor_args: {
              name,
              symbol,
              maxSupply,
              mintPrice,
              baseURI: baseURI || "https://example.com/metadata/"
            }
          })
          .eq('id', contract.id);

        console.log(`✅ Contract verified successfully`);
        return NextResponse.json({
          success: true,
          message: 'Contract verified successfully',
          verified: true,
          contractAddress,
          explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}#code`
        });
      } else {
        throw new Error(verifyResult.message || 'Verification failed');
      }
    } catch (verifyError) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Verification failed';
      
      // Update database with error
      await supabase
        .from('smart_contracts')
        .update({
          verification_status: 'failed',
          verification_attempts: (contract.verification_attempts || 0) + 1,
          verification_error: errorMessage
        })
        .eq('id', contract.id);

      console.error(`❌ Verification error: ${errorMessage}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Verification failed',
          error: errorMessage
        },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contract verification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify contract',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * Verify contract via Etherscan V2 API
 */
async function verifyViaEtherscan(
  contractAddress: string,
  name: string,
  symbol: string,
  maxSupply: number,
  mintPrice: string,
  baseURI: string
): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY not configured");
  }

  // Read contract source code
  const contractPath = path.join(process.cwd(), 'contracts/SimpleERC721.sol');
  const sourceCode = fs.readFileSync(contractPath, 'utf8');

  // Create verification request
  const verifyParams = new URLSearchParams({
    apikey: apiKey,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: 'SimpleERC721',
    compilerversion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: '1',
    runs: '200',
    constructorArguements: encodeConstructorArgs(name, symbol, maxSupply, mintPrice, baseURI),
    evmversion: 'istanbul',
    licenseType: '1' // MIT License
  });

  const postUrl = `https://api.etherscan.io/v2/api?chainid=84532`;
  const response = await fetch(postUrl, {
    method: 'POST',
    body: verifyParams
  });

  const data = (await response.json()) as EtherscanVerifyResponse;

  if (data.status === '1') {
    const guid = data.result;
    if (!guid || typeof guid !== 'string') {
      return { success: false, message: 'No GUID returned from Etherscan' };
    }
    console.log(`✅ Verification submitted. GUID: ${guid}`);
    
    // Poll for completion
    return await pollVerificationStatus(contractAddress, guid, apiKey);
  } else if (data.result?.includes('already verified')) {
    return { success: true, message: 'Contract already verified' };
  } else {
    return { success: false, message: data.result || 'Verification failed' };
  }
}

/**
 * Poll Etherscan for verification status
 */
async function pollVerificationStatus(
  contractAddress: string,
  guid: string,
  apiKey: string,
  maxAttempts: number = 20
): Promise<{ success: boolean; message: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    const checkParams = new URLSearchParams({
      chainid: '84532',
      apikey: apiKey,
      guid: guid,
      module: 'contract',
      action: 'checkverifystatus'
    });

    try {
      const response = await fetch(`https://api.etherscan.io/v2/api?${checkParams}`);
      const data = (await response.json()) as EtherscanVerifyResponse;

      if (data.result === '1') {
        console.log('✅ Verification completed successfully');
        return { success: true, message: 'Verified successfully' };
      } else if (data.result === '0') {
        console.log(`⏳ Verification in progress... (${attempt + 1}/${maxAttempts})`);
      } else if (data.result?.startsWith('Fail')) {
        return { success: false, message: data.result };
      }
    } catch (error) {
      console.warn(`⚠️ Poll error: ${error}`);
    }
  }

  return { success: false, message: 'Verification timeout - check status manually on BaseScan' };
}

/**
 * Encode constructor arguments for Etherscan verification
 */
function encodeConstructorArgs(
  name: string,
  symbol: string,
  maxSupply: number,
  mintPrice: string,
  baseURI: string
): string {
  // Use ethers AbiCoder to encode parameters
  const coder = AbiCoder.defaultAbiCoder();
  
  const encoded = coder.encode(
    ['string', 'string', 'uint256', 'uint256', 'string'],
    [name, symbol, maxSupply, mintPrice, baseURI]
  );
  
  // Remove '0x' prefix for Etherscan
  return encoded.slice(2);
}
