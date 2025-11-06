import { verify } from 'hardhat/internal/util/verify.js';
import { ethers } from 'hardhat';

async function main() {
  const contractAddress = process.argv[2];
  const name = process.argv[3] || 'Example NFT 2';
  const symbol = process.argv[4] || 'EXNFT2';
  const maxSupply = process.argv[5] || 500;
  const mintPrice = process.argv[6] || '1000000000000000';
  const baseURI = process.argv[7] || 'https://example.com/metadata/';
  
  console.log('🚀 Verifying contract...');
  console.log(`   Address: ${contractAddress}`);
  
  try {
    await hre.run('verify:verify', {
      address: contractAddress,
      constructorArguments: [name, symbol, maxSupply, mintPrice, baseURI],
      network: 'baseSepolia'
    });
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
