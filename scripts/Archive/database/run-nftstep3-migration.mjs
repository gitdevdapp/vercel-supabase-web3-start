import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyAndFixLoh7() {
  try {
    console.log("\n🔍 Checking loh7 collection status...");
    
    const { data: loh7, error } = await supabase
      .from("smart_contracts")
      .select("collection_slug, is_public, marketplace_enabled, total_minted, max_supply, contract_address")
      .eq("collection_slug", "loh7")
      .single();

    if (error) {
      console.error("❌ Failed to fetch loh7:", error);
      return false;
    }

    console.log("\n📊 Current loh7 Status:");
    console.log(`   - is_public: ${loh7.is_public}`);
    console.log(`   - marketplace_enabled: ${loh7.marketplace_enabled}`);
    console.log(`   - total_minted: ${loh7.total_minted}`);
    console.log(`   - max_supply: ${loh7.max_supply}`);
    console.log(`   - contract_address: ${loh7.contract_address}`);

    // Try to update via Supabase if not public
    if (!loh7.is_public) {
      console.log("\n   Attempting to make loh7 public via Supabase...");
      const { data: updated, error: updateError } = await supabase
        .from("smart_contracts")
        .update({
          is_public: true,
          marketplace_enabled: true
        })
        .eq("collection_slug", "loh7")
        .eq("is_active", true)
        .select();

      if (updateError) {
        console.error("   ❌ Update failed:", updateError);
        return false;
      }

      console.log("   ✅ loh7 updated to public!");
      console.log(JSON.stringify(updated, null, 2));
      return true;
    } else {
      console.log("   ✅ loh7 is already public!");
      return true;
    }
  } catch (error) {
    console.error("❌ Verification error:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting NFTSTEP3 Database Configuration");
  console.log("==========================================");

  // Show migration files
  console.log("\n📋 Migration Files:");
  console.log("   1. " + path.join(__dirname, "nftstep3-minting-integration.sql"));
  console.log("   2. " + path.join(__dirname, "loh7-make-public.sql"));

  // Verify and fix loh7
  const success = await verifyAndFixLoh7();

  if (success) {
    console.log("\n✅ Database configuration complete!");
    console.log("\n📌 NEXT STEPS:");
    console.log("   1. Clear browser cache (Cmd+Shift+Delete)");
    console.log("   2. Navigate to http://localhost:3000/marketplace/loh7");
    console.log("   3. Verify stats show 0/10000 (not random fake numbers)");
    console.log("   4. Test mint button");
  } else {
    console.log("\n❌ Configuration failed");
    process.exit(1);
  }
}

main();







