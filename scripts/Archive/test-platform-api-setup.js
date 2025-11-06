#!/usr/bin/env node

/**
 * Test Platform API Setup Script
 *
 * Verifies that CDP Platform API is properly configured and working
 * Tests the integration without making actual API calls if credentials are missing
 */

import fs from 'fs';
import path from 'path';

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment configuration...');

  const requiredVars = [
    'CDP_API_KEY_ID',
    'CDP_API_KEY_SECRET',
    'CDP_WALLET_SECRET'
  ];

  const missingVars = [];
  const presentVars = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      presentVars.push(varName);
    }
  }

  console.log(`✅ Present: ${presentVars.join(', ')}`);
  if (missingVars.length > 0) {
    console.log(`❌ Missing: ${missingVars.join(', ')}`);
  }

  return {
    configured: missingVars.length === 0,
    presentVars,
    missingVars
  };
}

function checkFileStructure() {
  console.log('\n📁 Checking file structure...');

  const requiredFiles = [
    'lib/cdp-platform.ts',
    'lib/cdp-erc721.ts',
    'app/api/contract/deploy/route.ts',
    'app/api/contract/mint/route.ts',
    'app/api/wallet/create/route.ts'
  ];

  const missingFiles = [];
  const presentFiles = [];

  for (const filePath of requiredFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      presentFiles.push(filePath);
    } else {
      missingFiles.push(filePath);
    }
  }

  console.log(`✅ Present: ${presentFiles.join(', ')}`);
  if (missingFiles.length > 0) {
    console.log(`❌ Missing: ${missingFiles.join(', ')}`);
  }

  return {
    complete: missingFiles.length === 0,
    presentFiles,
    missingFiles
  };
}

function checkCodeImports() {
  console.log('\n🔗 Checking code imports...');

  const filesToCheck = [
    'app/api/contract/deploy/route.ts',
    'app/api/contract/mint/route.ts',
    'app/api/wallet/create/route.ts'
  ];

  const issues = [];
  const cleanFiles = [];

  for (const filePath of filesToCheck) {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      issues.push(`File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for old CDP SDK imports
    if (content.includes('from "@coinbase/cdp-sdk"')) {
      issues.push(`Old CDP SDK import in ${filePath}`);
    }

    // Check for viem imports (should not be present in clean implementation)
    if (content.includes('from "viem"')) {
      issues.push(`Viem import in ${filePath} (should use Platform API only)`);
    }

    // Check for Platform API import
    if (content.includes('from "@/lib/cdp-platform"')) {
      cleanFiles.push(filePath);
    } else {
      issues.push(`Missing Platform API import in ${filePath}`);
    }
  }

  console.log(`✅ Clean files: ${cleanFiles.join(', ')}`);
  if (issues.length > 0) {
    console.log(`⚠️ Issues: ${issues.join(', ')}`);
  }

  return {
    clean: issues.length === 0,
    cleanFiles,
    issues
  };
}

function checkForRemovedFiles() {
  console.log('\n🗑️ Checking for removed files...');

  const removedFiles = [
    'lib/accounts.ts',
    'lib/cdp-ethers-adapter.ts',
    'app/api/contract/deploy/route.ts.backup',
    'app/api/contract/mint/route.ts.backup'
  ];

  const stillPresent = [];
  const successfullyRemoved = [];

  for (const filePath of removedFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      stillPresent.push(filePath);
    } else {
      successfullyRemoved.push(filePath);
    }
  }

  console.log(`✅ Removed: ${successfullyRemoved.join(', ')}`);
  if (stillPresent.length > 0) {
    console.log(`⚠️ Still present: ${stillPresent.join(', ')}`);
  }

  return {
    clean: stillPresent.length === 0,
    successfullyRemoved,
    stillPresent
  };
}

async function runTests() {
  console.log('🧪 CDP PLATFORM API SETUP VERIFICATION\n');

  const envCheck = checkEnvironmentVariables();
  const fileCheck = checkFileStructure();
  const importCheck = checkCodeImports();
  const removalCheck = checkForRemovedFiles();

  console.log('\n📊 SUMMARY:');
  console.log(`Environment configured: ${envCheck.configured ? '✅' : '❌'}`);
  console.log(`File structure complete: ${fileCheck.complete ? '✅' : '❌'}`);
  console.log(`Code imports clean: ${importCheck.clean ? '✅' : '❌'}`);
  console.log(`Old files removed: ${removalCheck.clean ? '✅' : '❌'}`);

  const overallSuccess = envCheck.configured && fileCheck.complete && importCheck.clean && removalCheck.clean;

  if (overallSuccess) {
    console.log('\n🎉 SETUP VERIFICATION PASSED!');
    console.log('✅ CDP Platform API integration is properly configured');
    console.log('✅ Ready for testing ERC721 deployment and minting');
    console.log('\nNext steps:');
    console.log('1. Ensure CDP API credentials are set in production');
    console.log('2. Test wallet creation via /api/wallet/create');
    console.log('3. Test ERC721 deployment via /api/contract/deploy');
    console.log('4. Test ERC721 minting via /api/contract/mint');
  } else {
    console.log('\n⚠️ SETUP VERIFICATION ISSUES FOUND');
    console.log('❌ Please address the issues above before proceeding');

    if (!envCheck.configured) {
      console.log('\n💡 To fix environment:');
      console.log('   - Set CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET');
      console.log('   - Use the same credentials from the working system');
    }

    if (!fileCheck.complete) {
      console.log('\n💡 To fix files:');
      console.log('   - Ensure all Platform API files are in place');
      console.log('   - Check lib/cdp-platform.ts exists and is functional');
    }

    if (!importCheck.clean) {
      console.log('\n💡 To fix imports:');
      console.log('   - Update API routes to use Platform API only');
      console.log('   - Remove any CDP SDK or viem imports');
    }
  }

  return overallSuccess;
}

// Run the verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Verification failed:', error.message);
      process.exit(1);
    });
}

export { runTests, checkEnvironmentVariables, checkFileStructure, checkCodeImports, checkForRemovedFiles };
