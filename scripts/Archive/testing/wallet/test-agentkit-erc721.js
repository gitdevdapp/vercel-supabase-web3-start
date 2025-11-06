/**
 * SIMPLEST POSSIBLE AGENTKIT ERC721 DEPLOYMENT TEST
 * 
 * This test determines if AgentKit can deploy a real ERC721 contract
 * on Base Sepolia using the existing CDP credentials.
 * 
 * Run with: node scripts/testing/test-agentkit-erc721.js
 */

import 'dotenv/config';

// Note: You may need to install @coinbase/agentkit first:
// npm install @coinbase/agentkit

let Agentkit;
try {
  const module = await import('@coinbase/agentkit');
  Agentkit = module.Agentkit;
} catch (e) {
  console.error('❌ AgentKit not installed. Install with: npm install @coinbase/agentkit');
  console.error('Error:', e.message);
  process.exit(1);
}

async function testAgentKitERC721Deployment() {
  console.log('🚀 Starting AgentKit ERC721 Deployment Test...\n');
  
  // Check environment variables
  if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
    console.error('❌ CDP credentials not found in environment variables');
    console.error('Please set CDP_API_KEY_ID and CDP_API_KEY_SECRET');
    process.exit(1);
  }
  
  try {
    // Step 1: Initialize AgentKit
    console.log('Step 1: Initializing AgentKit with CDP credentials...');
    console.log('API Key ID:', process.env.CDP_API_KEY_ID.substring(0, 8) + '...');
    
    const agentkit = new Agentkit({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
    });
    
    console.log('✅ AgentKit initialized successfully\n');
    
    // Step 2: Attempt ERC721 deployment
    console.log('Step 2: Attempting ERC721 deployment...');
    console.log('Network: Base Sepolia (base-sepolia)');
    console.log('Contract Name: SimpleTest');
    console.log('Symbol: TEST');
    console.log('Base URI: https://example.com/metadata/\n');
    
    const deployment = await agentkit.deployERC721({
      name: "SimpleTest",
      symbol: "TEST",
      baseURI: "https://example.com/metadata/",
    });
    
    console.log('✅ Deployment attempt completed\n');
    
    // Step 3: Log results
    console.log('📊 DEPLOYMENT RESULTS:');
    console.log('========================');
    console.log('Success:', deployment.success !== false);
    console.log('Contract Address:', deployment.contractAddress || deployment.address || 'N/A');
    console.log('Transaction Hash:', deployment.transactionHash || deployment.hash || deployment.tx_hash || 'N/A');
    console.log('Network:', deployment.network || 'base-sepolia');
    
    if (deployment.contractAddress) {
      console.log('\n🔗 Verify on BaseScan:');
      console.log(`https://sepolia.basescan.org/address/${deployment.contractAddress}`);
    }
    
    console.log('\n📋 Full Response:');
    console.log(JSON.stringify(deployment, null, 2));
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY');
    console.log('✅ AgentKit CAN deploy ERC721 contracts!');
    console.log('\n✨ Next Steps:');
    console.log('1. Verify contract on BaseScan (link above)');
    console.log('2. Update /app/api/contract/deploy/route.ts to use AgentKit');
    console.log('3. Remove mock fallback code');
    console.log('4. Deploy to production');
    
    return { success: true, deployment };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response:', error.response.data || error.response.body);
    }
    
    // Check for common issues
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.error('\n💡 Hint: AgentKit method not found - may need to use alternate approach');
      console.error('Try: agentkit.deploy_token() or agentkit.deploy_contract()');
    }
    
    if (error.message.includes('viem') || error.message.includes('BigInt')) {
      console.error('\n💡 Hint: Same viem errors as CDP SDK - AgentKit may have same limitations');
    }
    
    console.log('\n📋 Full Error:');
    console.log(error);
    
    return { success: false, error };
  }
}

// Run the test
console.log('='.repeat(60));
console.log('AGENTKIT ERC721 DEPLOYMENT TEST');
console.log('='.repeat(60));
console.log();

const result = await testAgentKitERC721Deployment();

console.log('\n' + '='.repeat(60));
if (result.success) {
  console.log('✅ TEST RESULT: SUCCESS');
  process.exit(0);
} else {
  console.log('❌ TEST RESULT: FAILED');
  process.exit(1);
}
console.log('='.repeat(60));
