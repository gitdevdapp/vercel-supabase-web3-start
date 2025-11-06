#!/usr/bin/env node

/**
 * DEPLOYMENT ARTIFACTS VERIFICATION TEST
 *
 * This test verifies that all necessary artifacts and configurations
 * are in place for ERC721 contract deployment.
 * Moved from root test-deploy-erc721.js
 *
 * Run with: node scripts/testing/test-deployment-artifacts.js
 */

import { readFileSync } from 'fs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const envContent = readFileSync('vercel-env-variables.txt.test', 'utf-8');
const envLines = envContent.split('\n').filter(line => !line.startsWith('#') && line.trim());
const env = {};

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

console.log('='.repeat(60));
console.log('🚀 DEPLOYMENT ARTIFACTS VERIFICATION TEST');
console.log('='.repeat(60));

async function testDeploymentArtifacts() {
  try {
    console.log('\n🔍 Testing deployment setup...\n');

    // Step 1: Check if artifacts exist
    console.log('1️⃣ Checking contract artifacts...');
    const artifactPath = path.join(__dirname, '../../artifacts/contracts/SimpleERC721.sol/SimpleERC721.json');

    let artifact;
    try {
      artifact = JSON.parse(readFileSync(artifactPath, 'utf-8'));
      console.log('✅ Contract artifact loaded');
      console.log('  📁 Path:', artifactPath);
    } catch (error) {
      console.log('❌ Contract artifact not found at:', artifactPath);
      console.log('   Please compile the contract first: npm run compile');
      return;
    }

    // Step 2: Analyze artifact content
    console.log('\n2️⃣ Analyzing artifact content...');
    console.log('  📋 ABI methods:', artifact.abi.filter(m => m.type === 'function').length, 'functions');

    const constructor = artifact.abi.find(m => m.type === 'constructor');
    if (constructor) {
      console.log('  🏗️ Constructor parameters:', constructor.inputs.length);
      console.log('     ', constructor.inputs.map(i => `${i.name}: ${i.type}`).join(', '));
    }

    console.log('  💾 Bytecode length:', artifact.bytecode.length, 'characters');
    console.log('  📊 Deployed bytecode length:', artifact.deployedBytecode.length, 'characters');

    // Step 3: Check if bytecode is valid (not empty)
    if (artifact.bytecode === '0x' || artifact.bytecode.length < 10) {
      console.log('❌ Bytecode is empty or invalid');
      console.log('   Please compile the contract: npm run compile');
      return;
    } else {
      console.log('✅ Bytecode is valid');
    }

    // Step 4: Check CDP configuration
    console.log('\n3️⃣ Checking CDP credentials...');
    const cdpWalletSecret = process.env.CDP_WALLET_SECRET;

    if (cdpWalletSecret) {
      console.log('✅ CDP_WALLET_SECRET configured');
      console.log('  🔑 Length:', cdpWalletSecret.length, 'characters');
      console.log('  👀 Preview:', cdpWalletSecret.substring(0, 8) + '...');
    } else {
      console.log('❌ CDP_WALLET_SECRET not configured');
      console.log('   Please check vercel-env-variables.txt.test');
    }

    // Step 5: Check contract compilation artifacts directory
    console.log('\n4️⃣ Checking compilation artifacts directory...');
    const artifactsDir = path.join(__dirname, '../../artifacts');
    try {
      const files = require('fs').readdirSync(artifactsDir);
      console.log('✅ Artifacts directory exists');
      console.log('  📁 Contents:', files.join(', '));

      // Check for contracts directory
      const contractsDir = path.join(artifactsDir, 'contracts');
      if (require('fs').existsSync(contractsDir)) {
        console.log('✅ Contracts directory exists');
        const contractFiles = require('fs').readdirSync(contractsDir);
        console.log('  📄 Contract files:', contractFiles.join(', '));
      } else {
        console.log('❌ Contracts directory missing');
      }
    } catch (error) {
      console.log('❌ Artifacts directory error:', error.message);
    }

    // Step 6: Verify contract ABI completeness
    console.log('\n5️⃣ Verifying ABI completeness...');
    const functions = artifact.abi.filter(m => m.type === 'function');
    const events = artifact.abi.filter(m => m.type === 'event');

    console.log('  🔧 Functions:', functions.length);
    console.log('  📢 Events:', events.length);

    // Check for essential ERC721 functions
    const essentialFunctions = ['mint', 'balanceOf', 'ownerOf', 'transferFrom', 'approve'];
    const foundEssential = essentialFunctions.filter(func =>
      functions.some(f => f.name === func)
    );

    console.log('  ✅ Essential ERC721 functions:', foundEssential.length, '/', essentialFunctions.length);
    if (foundEssential.length === essentialFunctions.length) {
      console.log('    All essential functions present');
    } else {
      console.log('    Missing functions:', essentialFunctions.filter(f => !foundEssential.includes(f)));
    }

    // Step 7: Overall assessment
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT READINESS ASSESSMENT');
    console.log('='.repeat(60));

    const allChecks = [
      { name: 'Contract Artifact', status: !!artifact },
      { name: 'Valid Bytecode', status: artifact.bytecode.length > 10 },
      { name: 'CDP Credentials', status: !!cdpWalletSecret },
      { name: 'ABI Functions', status: functions.length > 0 },
      { name: 'Essential ERC721', status: foundEssential.length === essentialFunctions.length }
    ];

    const passedChecks = allChecks.filter(check => check.status).length;

    allChecks.forEach(check => {
      console.log(`  ${check.name}: ${check.status ? '✅' : '❌'}`);
    });

    console.log('\n📈 Overall Score:', `${passedChecks}/${allChecks.length}`, `(${(passedChecks/allChecks.length*100).toFixed(0)}%)`);

    if (passedChecks === allChecks.length) {
      console.log('\n🎉 ALL CHECKS PASSED!');
      console.log('✅ Ready for ERC721 deployment');
      console.log('\n📋 Next Steps:');
      console.log('1. Run: node scripts/testing/test-agentkit-erc721.js');
      console.log('2. Test deployment on Base Sepolia');
      console.log('3. Verify contract on BaseScan');
    } else {
      console.log('\n⚠️ SOME CHECKS FAILED');
      console.log('❌ Please address the issues above before deployment');
    }

    console.log('\n' + '='.repeat(60));

  } catch (e) {
    console.error('\n❌ Test error:', e.message);
    console.error('Stack trace:', e.stack?.split('\n').slice(0, 3).join('\n'));
  }
}

// Run the test
testDeploymentArtifacts().catch(console.error);
