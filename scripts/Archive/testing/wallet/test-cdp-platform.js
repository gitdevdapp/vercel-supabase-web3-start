#!/usr/bin/env node

/**
 * CDP Platform API Integration Tests
 *
 * Tests the new CDP Platform API implementation to ensure ERC721 operations work correctly
 * Replaces the buggy CDP SDK with direct API calls
 */

const { CdpPlatformClient } = require('../../lib/cdp-platform');
const { ERC721Manager } = require('../../lib/cdp-erc721');

async function testCDPPlatformAPI() {
  console.log('🧪 Starting CDP Platform API Integration Tests...\n');

  const client = new CdpPlatformClient();
  const erc721Manager = new ERC721Manager();

  try {
    // Test 1: Wallet Creation
    console.log('📝 Test 1: Creating CDP Wallet...');
    const wallet = await client.createWallet('TestWallet-PlatformAPI');
    console.log('✅ Wallet created successfully:', {
      id: wallet.id,
      address: wallet.address,
      network: wallet.network
    });

    // Test 2: Wallet Balance Check
    console.log('\n📝 Test 2: Checking Wallet Balance...');
    const balance = await client.getWalletBalance(wallet.id);
    console.log('✅ Wallet balance:', balance, 'ETH');

    // Test 3: ERC721 Contract Deployment
    console.log('\n📝 Test 3: Deploying ERC721 Contract...');
    const contract = await erc721Manager.deployContract(
      'Test NFT Collection',
      'TESTNFT',
      wallet.id,
      {
        maxSupply: 1000,
        mintPrice: '0.001',
        baseURI: 'https://api.example.com/metadata/'
      }
    );

    console.log('✅ ERC721 Contract deployed:', {
      address: contract.address,
      name: contract.name,
      symbol: contract.symbol,
      deploymentHash: contract.deploymentHash
    });

    // Test 4: Single Token Minting
    console.log('\n📝 Test 4: Minting Single ERC721 Token...');
    const mintResult = await erc721Manager.mintToken(
      contract.address,
      wallet.id,
      wallet.address,
      1
    );

    console.log('✅ Single token minted:', {
      tokenId: 1,
      transactionHash: mintResult.hash,
      recipient: wallet.address
    });

    // Test 5: Batch Token Minting
    console.log('\n📝 Test 5: Batch Minting ERC721 Tokens...');
    const batchMints = [
      { to: wallet.address, tokenId: 2 },
      { to: wallet.address, tokenId: 3 },
      { to: wallet.address, tokenId: 4 }
    ];

    const batchResults = await erc721Manager.batchMint(
      contract.address,
      wallet.id,
      batchMints
    );

    console.log('✅ Batch minting completed:', {
      tokensMinted: batchResults.length,
      transactionHashes: batchResults.map(r => r.hash)
    });

    // Test 6: Token Transfer
    console.log('\n📝 Test 6: Transferring ERC721 Token...');
    const transferResult = await erc721Manager.transferToken(
      contract.address,
      wallet.id,
      wallet.address,
      '0x0000000000000000000000000000000000000000', // Burn address for testing
      4
    );

    console.log('✅ Token transferred:', {
      tokenId: 4,
      transactionHash: transferResult.hash
    });

    // Test 7: Contract Info Retrieval
    console.log('\n📝 Test 7: Getting Contract Information...');
    const contractInfo = await erc721Manager.getContractInfo(contract.address);
    console.log('✅ Contract info retrieved:', contractInfo);

    // Test 8: ETH Transfer
    console.log('\n📝 Test 8: Sending ETH Transfer...');
    const ethTransfer = await client.sendETH(
      wallet.id,
      '0x0000000000000000000000000000000000000000', // Test address
      '0.001'
    );

    console.log('✅ ETH transfer initiated:', {
      amount: '0.001 ETH',
      transactionHash: ethTransfer.hash
    });

    // Summary
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('\n📊 Test Summary:');
    console.log('- ✅ Wallet Creation: SUCCESS');
    console.log('- ✅ Balance Check: SUCCESS');
    console.log('- ✅ ERC721 Deployment: SUCCESS');
    console.log('- ✅ Single Minting: SUCCESS');
    console.log('- ✅ Batch Minting: SUCCESS');
    console.log('- ✅ Token Transfer: SUCCESS');
    console.log('- ✅ Contract Info: SUCCESS');
    console.log('- ✅ ETH Transfer: SUCCESS');

    console.log('\n🚀 CDP Platform API is working perfectly!');
    console.log('💡 Ready to replace the buggy CDP SDK implementation');

    console.log('\n📋 Deployed Contract Details:');
    console.log(`- Contract Address: ${contract.address}`);
    console.log(`- Network: ${contract.network}`);
    console.log(`- Explorer: https://sepolia.basescan.org/address/${contract.address}`);
    console.log(`- Deployment TX: https://sepolia.basescan.org/tx/${contract.deploymentHash}`);

    console.log('\n📋 Minted Tokens:');
    console.log(`- Token 1: https://sepolia.basescan.org/tx/${mintResult.hash}`);
    console.log(`- Tokens 2-4: ${batchResults.map(r => `https://sepolia.basescan.org/tx/${r.hash}`).join(', ')}`);

    return {
      success: true,
      wallet,
      contract,
      transactions: [
        mintResult,
        ...batchResults,
        transferResult,
        ethTransfer
      ]
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);

    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests if called directly
if (require.main === module) {
  testCDPPlatformAPI()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Integration tests completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Integration tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error during testing:', error);
      process.exit(1);
    });
}

module.exports = { testCDPPlatformAPI };
