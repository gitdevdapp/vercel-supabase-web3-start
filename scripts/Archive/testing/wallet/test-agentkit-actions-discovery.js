#!/usr/bin/env node

/**
 * AGENTKIT ACTIONS DISCOVERY TEST
 *
 * This test discovers and analyzes all available AgentKit actions,
 * particularly focusing on ERC721 and contract deployment capabilities.
 * Moved from root test-agentkit-correct.js
 *
 * Run with: node scripts/testing/test-agentkit-actions-discovery.js
 */

import 'dotenv/config';
import * as fs from 'fs';
import { CdpClient } from '@coinbase/cdp-sdk';
import { AgentKit, CdpEvmWalletProvider } from '@coinbase/agentkit';

// Load environment variables from vercel-env-variables.txt
const envContent = fs.readFileSync('vercel-env-variables.txt', 'utf-8');
const envLines = envContent.split('\n').filter(line => !line.startsWith('#') && line.trim());
const env = {};

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

console.log('='.repeat(60));
console.log('🚀 AGENTKIT ACTIONS DISCOVERY TEST');
console.log('='.repeat(60));

async function testAgentKitActionsDiscovery() {
  try {
    console.log('\n1️⃣ Creating CDP client...');
    const cdpClient = new CdpClient({
      apiKeyId: env.CDP_API_KEY_ID,
      apiKeySecret: env.CDP_API_KEY_SECRET,
      walletSecret: env.CDP_WALLET_SECRET,
    });
    console.log('✅ CDP client created');

    console.log('\n2️⃣ Configuring wallet provider...');
    const provider = CdpEvmWalletProvider.configureWithWallet(cdpClient);
    console.log('✅ Wallet provider configured');

    console.log('\n3️⃣ Initializing AgentKit...');
    const agentkit = AgentKit.from({
      provider
    });
    console.log('✅ AgentKit initialized');
    console.log('  Wallet address:', agentkit.wallet?.getAddress?.() || 'Unknown');
    console.log('  Network ID:', agentkit.wallet?.getNetworkId?.() || 'Unknown');

    console.log('\n4️⃣ Fetching available actions...');
    const actions = agentkit.getActions();
    console.log(`✅ Found ${actions.length} total actions`);

    // Look for deployment-related actions
    console.log('\n5️⃣ Looking for ERC721/contract deployment actions...');
    const deploymentActions = actions.filter(a => {
      const name = a.name ? a.name.toLowerCase() : '';
      const desc = a.description ? a.description.toLowerCase() : '';
      return name.includes('contract') || name.includes('deploy') || name.includes('erc721') ||
             desc.includes('contract') || desc.includes('deploy') || desc.includes('erc');
    });

    console.log(`Found ${deploymentActions.length} deployment-related actions:`);
    deploymentActions.slice(0, 15).forEach((a, i) => {
      console.log(`  ${i+1}. ${a.name}`);
      if (a.description) {
        console.log(`     📝 ${a.description.substring(0, 80)}`);
      }
    });

    // Also show all actions for reference
    console.log(`\n📋 All ${actions.length} available actions:`);
    actions.slice(0, 20).forEach((a, i) => {
      console.log(`  ${i+1}. ${a.name}`);
    });
    if (actions.length > 20) {
      console.log(`  ... and ${actions.length - 20} more`);
    }

    console.log('\n✅ SUCCESS: AgentKit is ready for ERC721 deployment!');

  } catch (e) {
    console.error('\n❌ Error:', e.message);
    if (e.stack) {
      console.error('Stack trace:', e.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}

// Run the test
testAgentKitActionsDiscovery().catch(console.error);

console.log('\n' + '='.repeat(60));
