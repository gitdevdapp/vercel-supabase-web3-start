import { createClient } from "@supabase/supabase-js";
import { deployERC721 } from "../../lib/erc721-deploy.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deployAndPublish() {
  try {
    console.log("🚀 Deploying test ERC721 contract");
    console.log("==================================\n");

    // Deploy contract
    const contractName = `TestNFT-${Date.now()}`;
    const deployment = await deployERC721({
      name: contractName,
      symbol: "TEST",
      maxSupply: 1000,
      mintPrice: "0" // Free minting
    });

    console.log("✅ Contract deployed!");
    console.log(`   Address: ${deployment.contractAddress}`);
    console.log(`   TX Hash: ${deployment.transactionHash}\n`);

    // Now make it public in database
    console.log("📝 Making contract public...");
    
    // First, get the contract from the database
    const { data: contract, error: fetchError } = await supabase
      .from("smart_contracts")
      .select("*")
      .eq("contract_address", deployment.contractAddress)
      .single();

    if (fetchError) {
      console.error("❌ Failed to fetch contract:", fetchError);
      return false;
    }

    console.log(`   Found contract: ${contract.collection_name || 'Unnamed'}`);

    // Update to make it public
    const { data: updated, error: updateError } = await supabase
      .from("smart_contracts")
      .update({
        is_public: true,
        marketplace_enabled: true
      })
      .eq("contract_address", deployment.contractAddress)
      .select();

    if (updateError) {
      console.error("❌ Failed to make public:", updateError);
      return false;
    }

    console.log("✅ Contract is now public!\n");
    console.log("📊 Contract Details:");
    console.log(`   Name: ${updated[0].collection_name}`);
    console.log(`   Max Supply: ${updated[0].max_supply}`);
    console.log(`   Mint Price: ${updated[0].mint_price_wei} wei`);
    console.log(`   Is Public: ${updated[0].is_public}`);
    console.log(`   Marketplace Enabled: ${updated[0].marketplace_enabled}\n`);

    console.log("✅ Test contract ready!");
    console.log(`   View at: http://localhost:3000/marketplace/${contract.collection_slug}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    return false;
  }
}

deployAndPublish().then(success => {
  process.exit(success ? 0 : 1);
});
