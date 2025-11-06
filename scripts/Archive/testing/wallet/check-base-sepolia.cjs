#!/usr/bin/env node

/**
 * Check Base Sepolia for CDP Transactions
 * Searches for any recent CDP-related transactions on Base Sepolia
 */

const addresses = [
  '0x4aA12ABE0F0f20F4D2E24099fd3e5B4303a18cdf', // From previous browser session
  '0xf8441d82FF98632Ed4046Aa17C0CbeD9f607DCCc', // From database query
];

const BASESCAN_API_KEY = 'YourApiKeyToken'; // Free tier doesn't need API key for basic queries

console.log('🔍 CHECKING BASE SEPOLIA FOR CDP TRANSACTIONS');
console.log('='.repeat(50));

async function checkBaseSepolia() {
  try {
    console.log('Checking for transactions from known wallet addresses...');
    
    for (const address of addresses) {
      console.log(`\n🔍 Checking wallet: ${address}`);
      
      try {
        const response = await fetch(
          `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${BASESCAN_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.status === '1' && data.result && data.result.length > 0) {
          console.log(`✅ Found ${data.result.length} transactions:`);
          
          data.result.slice(0, 3).forEach((tx, index) => {
            console.log(`   ${index + 1}. ${tx.hash}`);
            console.log(`      From: ${tx.from}`);
            console.log(`      To: ${tx.to}`);
            console.log(`      Value: ${tx.value} wei`);
            console.log(`      Status: ${tx.txreceipt_status === '1' ? '✅ Success' : '❌ Failed'}`);
            console.log(`      Block: ${tx.blockNumber}`);
            console.log(`      Time: ${new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}`);
            
            if (tx.to === '' || tx.contractAddress) {
              console.log(`      💰 Contract Creation: ${tx.contractAddress || 'Yes'}`);
            }
            console.log('');
          });
          
          if (data.result.length > 3) {
            console.log(`   ... and ${data.result.length - 3} more transactions`);
          }
        } else {
          console.log(`❌ No transactions found for ${address}`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${address}:`, error.message);
      }
    }

    console.log('\n🔍 Checking for recent contract deployments on Base Sepolia...');
    
    try {
      // Check for recent contract creations
      const response = await fetch(
        `https://api.basescan.org/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=&topic0=0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925&apikey=${BASESCAN_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === '1' && data.result && data.result.length > 0) {
        console.log(`✅ Found ${data.result.length} contract events`);
        data.result.slice(0, 2).forEach((event, index) => {
          console.log(`   ${index + 1}. Block ${event.blockNumber}: ${event.transactionHash}`);
        });
      } else {
        console.log('❌ No contract creation events found');
      }
    } catch (error) {
      console.error('❌ Error checking contract events:', error.message);
    }

    console.log('\n📊 SUMMARY:');
    console.log('If transactions are found above, the CDP deployment is working!');
    console.log('If no transactions are found, deployments may not have completed yet.');
    console.log('\n🔗 To verify manually:');
    console.log('   - Visit: https://sepolia.basescan.org');
    console.log('   - Search for any of the wallet addresses above');
    console.log('   - Look for successful contract creation transactions');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

checkBaseSepolia();
