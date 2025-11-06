#!/usr/bin/env node

/**
 * CDP Wallet Creation Test Script
 *
 * This script tests CDP client initialization strategies
 * Moved from /api/test/cdp-wallet-create/route.ts
 *
 * Run with: node scripts/testing/test-cdp-wallet-create.js
 */

import { CdpClient } from '@coinbase/cdp-sdk';
import 'dotenv/config';
import { readFileSync } from 'fs';

// Load vercel environment variables
try {
  const envContent = readFileSync('vercel-env-variables.txt', 'utf-8');
  const envLines = envContent.split('\n').filter(line => !line.startsWith('#') && line.trim());

  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('✅ Loaded vercel-env-variables.txt');
} catch (error) {
  console.log('⚠️ Could not load vercel-env-variables.txt:', error.message);
}

// TypeScript-style interfaces converted to JSDoc for JavaScript
/**
 * @typedef {Object} TestResult
 * @property {string} test
 * @property {string} status
 * @property {string} method
 * @property {string} [address]
 * @property {string} [accountName]
 * @property {string} [error]
 * @property {number} [statusCode]
 * @property {string} [errorType]
 * @property {string} [correlationId]
 */

/**
 * @typedef {Object} Results
 * @property {string} timestamp
 * @property {Object} environment
 * @property {boolean} environment.hasApiKeyId
 * @property {boolean} environment.hasApiKeySecret
 * @property {boolean} environment.hasWalletSecret
 * @property {number} environment.apiKeyIdLength
 * @property {string} environment.apiKeyIdPreview
 * @property {TestResult[]} tests
 * @property {Object} [summary]
 * @property {number} summary.total
 * @property {number} summary.passed
 * @property {number} summary.failed
 */

async function testCDPWalletCreation() {
  console.log('='.repeat(60));
  console.log('🚀 CDP WALLET CREATION TEST');
  console.log('='.repeat(60));

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      hasApiKeyId: !!process.env.CDP_API_KEY_ID,
      hasApiKeySecret: !!process.env.CDP_API_KEY_SECRET,
      hasWalletSecret: !!process.env.CDP_WALLET_SECRET,
      apiKeyIdLength: process.env.CDP_API_KEY_ID?.length,
      apiKeyIdPreview: process.env.CDP_API_KEY_ID?.substring(0, 8),
    },
    tests: []
  };

  console.log('\n📋 Environment Check:');
  console.log('  CDP_API_KEY_ID:', results.environment.hasApiKeyId ? '✓' : '❌');
  console.log('  CDP_API_KEY_SECRET:', results.environment.hasApiKeySecret ? '✓' : '❌');
  console.log('  CDP_WALLET_SECRET:', results.environment.hasWalletSecret ? '✓' : '❌');
  console.log('  API Key Preview:', results.environment.apiKeyIdPreview + '...');

  if (!results.environment.hasApiKeyId || !results.environment.hasApiKeySecret || !results.environment.hasWalletSecret) {
    console.log('\n❌ Missing CDP credentials. Please check environment variables.');
    return results;
  }

  // Test 1: Constructor with explicit parameters
  console.log('\n🧪 Test 1: Constructor with explicit parameters');
  try {
    results.tests.push({
      test: "1_constructor_explicit",
      status: "attempting",
      method: "new CdpClient({ apiKeyId, apiKeySecret, walletSecret })"
    });

    const cdp1 = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      walletSecret: process.env.CDP_WALLET_SECRET,
    });

    const accountName1 = `test-constructor-${Date.now()}`;
    const account1 = await cdp1.evm.getOrCreateAccount({ name: accountName1 });

    results.tests[results.tests.length - 1].status = "success";
    results.tests[results.tests.length - 1].address = account1.address;
    results.tests[results.tests.length - 1].accountName = accountName1;

    console.log('  ✅ SUCCESS: Account created:', account1.address);

  } catch (error) {
    const err = error;
    results.tests[results.tests.length - 1].status = "failed";
    results.tests[results.tests.length - 1].error = err.message || 'Unknown error';
    if (err.statusCode) results.tests[results.tests.length - 1].statusCode = err.statusCode;
    if (err.errorType) results.tests[results.tests.length - 1].errorType = err.errorType;
    if (err.correlationId) results.tests[results.tests.length - 1].correlationId = err.correlationId;

    console.log('  ❌ FAILED:', err.message);
    if (err.statusCode) console.log('     Status Code:', err.statusCode);
    if (err.errorType) console.log('     Error Type:', err.errorType);
  }

  // Test 2: Constructor with no parameters (rely on env vars)
  console.log('\n🧪 Test 2: Constructor with environment variables');
  try {
    results.tests.push({
      test: "2_constructor_envvars",
      status: "attempting",
      method: "new CdpClient() - relies on process.env"
    });

    // Ensure process.env has the values (already set from .env file)

    const cdp2 = new CdpClient();
    const accountName2 = `test-envvars-${Date.now()}`;
    const account2 = await cdp2.evm.getOrCreateAccount({ name: accountName2 });

    results.tests[results.tests.length - 1].status = "success";
    results.tests[results.tests.length - 1].address = account2.address;
    results.tests[results.tests.length - 1].accountName = accountName2;

    console.log('  ✅ SUCCESS: Account created:', account2.address);

  } catch (error) {
    const err = error;
    results.tests[results.tests.length - 1].status = "failed";
    results.tests[results.tests.length - 1].error = err.message || 'Unknown error';
    if (err.statusCode) results.tests[results.tests.length - 1].statusCode = err.statusCode;
    if (err.errorType) results.tests[results.tests.length - 1].errorType = err.errorType;
    if (err.correlationId) results.tests[results.tests.length - 1].correlationId = err.correlationId;

    console.log('  ❌ FAILED:', err.message || 'Unknown error');
    if (err.statusCode) console.log('     Status Code:', err.statusCode);
    if (err.errorType) console.log('     Error Type:', err.errorType);
  }

  // Summary
  results.summary = {
    total: results.tests.length,
    passed: results.tests.filter(t => t.status === "success").length,
    failed: results.tests.filter(t => t.status === "failed").length,
  };

  console.log('\n📊 Summary:');
  console.log(`  Total Tests: ${results.summary.total}`);
  console.log(`  Passed: ${results.summary.passed}`);
  console.log(`  Failed: ${results.summary.failed}`);
  console.log(`  Success Rate: ${results.summary.total > 0 ? Math.round((results.summary.passed / results.summary.total) * 100) : 0}%`);

  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.tests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.test}: ${test.status.toUpperCase()}`);
    if (test.address) {
      console.log(`     Address: ${test.address}`);
    }
    if (test.accountName) {
      console.log(`     Account Name: ${test.accountName}`);
    }
    if (test.error) {
      console.log(`     Error: ${test.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));

  if (results.summary.passed > 0) {
    console.log('✅ CDP WALLET CREATION WORKING');
    console.log('   Ready for ERC721 deployment integration');
  } else {
    console.log('❌ CDP WALLET CREATION FAILED');
    console.log('   Check CDP credentials and network connectivity');
  }

  return results;
}

// Run the test
testCDPWalletCreation().catch(console.error);
