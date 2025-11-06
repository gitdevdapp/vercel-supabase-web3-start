import hre from 'hardhat';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 6) {
    console.error('Usage: node hardhat-verify-direct.mjs <ADDRESS> <NAME> <SYMBOL> <MAX_SUPPLY> <MINT_PRICE> <BASE_URI>');
    process.exit(1);
  }
  
  const address = args[0];
  const name = args[1];
  const symbol = args[2];
  const maxSupply = parseInt(args[3]);
  const mintPrice = args[4];
  const baseURI = args[5];
  
  console.log('🚀 Verifying contract with hardhat...');
  console.log(`Address: ${address}`);
  
  try {
    await hre.run('verify:verify', {
      address: address,
      constructorArguments: [name, symbol, maxSupply, mintPrice, baseURI],
    });
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    if (error.message.includes('Already Verified')) {
      console.log('Contract is already verified!');
      process.exit(0);
    }
    process.exit(1);
  }
}

main();
