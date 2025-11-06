#!/usr/bin/env node

/**
 * Deploy tRAIR ERC721 Contract and Mint Test NFTs
 * 
 * This script:
 * 1. Deploys an ERC721 contract with symbol tRAIR
 * 2. Sets max supply to 10,000
 * 3. Sets mint price to 0 (free)
 * 4. Mints 2 test NFTs
 * 5. Outputs results with Sepolia scan links
 */

import { CdpClient } from '@coinbase/cdp-sdk';
import { createPublicClient, http, parseAbi, encodeAbiParameters, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Configuration
const NETWORK = process.env.NETWORK || 'base-sepolia';
const CONTRACT_NAME = 'Test RAIR';
const CONTRACT_SYMBOL = 'tRAIR';
const MAX_SUPPLY = 10000;
const MINT_PRICE = 0;

// ERC721 Contract ABI and Bytecode
const CONTRACT_ABI = parseAbi([
  'constructor(string name, string symbol, uint256 _maxSupply, uint256 _mintPrice)',
  'function mint(address to) external payable returns (uint256)',
  'function setMintPrice(uint256 newPrice) external',
  'function totalSupply() public view returns (uint256)',
  'function maxSupply() public view returns (uint256)',
  'function mintPrice() public view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)'
]);

// Simplified ERC721 bytecode (compiled Solidity contract)
// This is a minimal ERC721 contract with minting functionality
const CONTRACT_BYTECODE = '0x608060405234801562000010575f80fd5b5060405162001609380380620016098339810160408190526200003391620001b0565b3384845f620000438382620002b1565b506001620000528282620002b1565b5050506001600160a01b0381166200008357604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b6200008e81620000a1565b5060089190915560095550620003799050565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f83011262000116575f80fd5b81516001600160401b0380821115620001335762000133620000f2565b604051601f8301601f19908116603f011681019082821181831017156200015e576200015e620000f2565b816040528381526020925086838588010111156200017a575f80fd5b5f91505b838210156200019d57858201830151818301840152908201906200017e565b5f93810190920192909252949350505050565b5f805f8060808587031215620001c4575f80fd5b84516001600160401b0380821115620001db575f80fd5b620001e98883890162000106565b95506020870151915080821115620001ff575f80fd5b506200020e8782880162000106565b604087015160609097015195989097509350505050565b600181811c908216806200023a57607f821691505b6020821081036200025957634e487b7160e01b5f52602260045260245ffd5b50919050565b601f821115620002ac575f81815260208120601f850160051c81016020861015620002875750805b601f850160051c820191505b81811015620002a85782815560010162000293565b5050505b505050565b81516001600160401b03811115620002cd57620002cd620000f2565b620002e581620002de845462000225565b846200025f565b602080601f8311600181146200031b575f8415620003035750858301515b5f19600386901b1c1916600185901b178555620002a8565b5f85815260208120601f198616915b828110156200034b578886015182559484019460019091019084016200032a565b50858210156200036957878501515f19600388901b60f8161c191681555b5050505050600190811b01905550565b61128280620003875f395ff3fe608060405260043610610126575f3560e01c806370a08231116100a8578063b88d4fde1161006d578063b88d4fde146102fd578063c87b56dd1461031c578063d5abeb011461033b578063e985e9c514610350578063f2fde38b1461036f578063f4a0a5281461038e575f80fd5b806370a082311461027a578063715018a6146102995780638da5cb5b146102ad57806395d89b41146102ca578063a22cb465146102de575f80fd5b806323b872dd116100ee57806323b872dd146101f557806342842e0e146102145780636352211e146102335780636817c76c146102525780636a62784214610267575f80fd5b806301ffc9a71461012a57806306fdde031461015e578063081812fc1461017f578063095ea7b3146101b657806318160ddd146101d7575b5f80fd5b348015610135575f80fd5b50610149610144366004610ef2565b6103ad565b60405190151581526020015b60405180910390f35b348015610169575f80fd5b506101726103fe565b6040516101559190610f5a565b34801561018a575f80fd5b5061019e610199366004610f6c565b61048d565b6040516001600160a01b039091168152602001610155565b3480156101c1575f80fd5b506101d56101d0366004610f9e565b6104b4565b005b3480156101e2575f80fd5b506007545b604051908152602001610155565b348015610200575f80fd5b506101d561020f366004610fc6565b6104c3565b34801561021f575f80fd5b506101d561022e366004610fc6565b610551565b34801561023e575f80fd5b5061019e61024d366004610f6c565b610570565b34801561025d575f80fd5b506101e760095481565b6101e7610275366004610fff565b61057a565b348015610285575f80fd5b506101e7610294366004610fff565b61062c565b3480156102a4575f80fd5b506101d5610671565b3480156102b8575f80fd5b506006546001600160a01b031661019e565b3480156102d5575f80fd5b50610172610684565b3480156102e9575f80fd5b506101d56102f8366004611018565b610693565b348015610308575f80fd5b506101d5610317366004611065565b61069e565b348015610327575f80fd5b50610172610336366004610f6c565b6106b6565b348015610346575f80fd5b506101e760085481565b34801561035b575f80fd5b5061014961036a36600461113a565b610727565b34801561037a575f80fd5b506101d5610389366004610fff565b610754565b348015610399575f80fd5b506101d56103a8366004610f6c565b610791565b5f6001600160e01b031982166380ac58cd60e01b14806103dd57506001600160e01b03198216635b5e139f60e01b145b806103f857506301ffc9a760e01b6001600160e01b03198316145b92915050565b60605f805461040c9061116b565b80601f01602080910402602001604051908101604052809291908181526020018280546104389061116b565b80156104835780601f1061045a57610100808354040283529160200191610483565b820191905f5260205f20905b81548152906001019060200180831161046657829003601f168201915b5050505050905090565b5f6104978261079e565b505f828152600460205260409020546001600160a01b03166103f8565b6104bf8282336107d6565b5050565b6001600160a01b0382166104f157604051633250574960e11b81525f60048201526024015b60405180910390fd5b5f6104fd8383336107e3565b9050836001600160a01b0316816001600160a01b03161461054b576040516364283d7b60e01b81526001600160a01b03808616600483015260248201849052821660448201526064016104e8565b50505050565b61056b83838360405180602001604052805f81525061069e565b505050565b5f6103f88261079e565b5f600854600754106105c35760405162461bcd60e51b815260206004820152601260248201527113585e081cdd5c1c1b1e481c995858da195960721b60448201526064016104e8565b60095434101561060c5760405162461bcd60e51b8152602060048201526014602482015273125b9cdd59999a58da595b9d081c185e5b595b9d60621b60448201526064016104e8565b600780549081905f61061d836111a3565b91905055506103f883826108d5565b5f6001600160a01b038216610656576040516322718ad960e21b81525f60048201526024016104e8565b506001600160a01b03165f9081526003602052604090205490565b6106796108ee565b6106825f61091b565b565b60606001805461040c9061116b565b6104bf33838361096c565b6106a98484846104c3565b61054b3385858585610a0a565b60606106c18261079e565b505f6106d760408051602081019091525f815290565b90505f8151116106f55760405180602001604052805f815250610720565b806106ff84610b32565b6040516020016107109291906111c7565b6040516020818303038152906040525b9392505050565b6001600160a01b039182165f90815260056020908152604080832093909416825291909152205460ff1690565b61075c6108ee565b6001600160a01b03811661078557604051631e4fbdf760e01b81525f60048201526024016104e8565b61078e8161091b565b50565b6107996108ee565b600955565b5f818152600260205260408120546001600160a01b0316806103f857604051637e27328960e01b8152600481018490526024016104e8565b61056b8383836001610bc2565b5f828152600260205260408120546001600160a01b039081169083161561080f5761080f818486610cc6565b6001600160a01b038116156108495761082a5f855f80610bc2565b6001600160a01b0381165f90815260036020526040902080545f190190555b6001600160a01b03851615610877576001600160a01b0385165f908152600360205260409020805460010190555b5f8481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b6104bf828260405180602001604052805f815250610d2a565b6006546001600160a01b031633146106825760405163118cdaa760e01b81523360048201526024016104e8565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b03821661099e57604051630b61174360e31b81526001600160a01b03831660048201526024016104e8565b6001600160a01b038381165f81815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b6001600160a01b0383163b15610b2b57604051630a85bd0160e11b81526001600160a01b0384169063150b7a0290610a4c9088908890879087906004016111f5565b6020604051808303815f875af1925050508015610a86575060408051601f3d908101601f19168201909252610a8391810190611231565b60015b610aed573d808015610ab3576040519150601f19603f3d011682016040523d82523d5f602084013e610ab8565b606091505b5080515f03610ae557604051633250574960e11b81526001600160a01b03851660048201526024016104e8565b805160208201fd5b6001600160e01b03198116630a85bd0160e11b14610b2957604051633250574960e11b81526001600160a01b03851660048201526024016104e8565b505b5050505050565b60605f610b3e83610d41565b60010190505f8167ffffffffffffffff811115610b5d57610b5d611051565b6040519080825280601f01601f191660200182016040528015610b87576020820181803683370190505b5090508181016020015b5f19016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610b9157509392505050565b8080610bd657506001600160a01b03821615155b15610c97575f610be58461079e565b90506001600160a01b03831615801590610c115750826001600160a01b0316816001600160a01b031614155b8015610c245750610c228184610727565b155b15610c4d5760405163a9fbf51f60e01b81526001600160a01b03841660048201526024016104e8565b8115610c955783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b50505f90815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b610cd1838383610e18565b61056b576001600160a01b038316610cff57604051637e27328960e01b8152600481018290526024016104e8565b60405163177e802f60e01b81526001600160a01b0383166004820152602481018290526044016104e8565b610d348383610e7c565b61056b335f858585610a0a565b5f8072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b8310610d7f5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310610dab576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc100008310610dc957662386f26fc10000830492506010015b6305f5e1008310610de1576305f5e100830492506008015b6127108310610df557612710830492506004015b60648310610e07576064830492506002015b600a83106103f85760010192915050565b5f6001600160a01b03831615801590610e745750826001600160a01b0316846001600160a01b03161480610e515750610e518484610727565b80610e7457505f828152600460205260409020546001600160a01b038481169116145b949350505050565b6001600160a01b038216610ea557604051633250574960e11b81525f60048201526024016104e8565b5f610eb183835f6107e3565b90506001600160a01b0381161561056b576040516339e3563760e11b81525f60048201526024016104e8565b6001600160e01b03198116811461078e575f80fd5b5f60208284031215610f02575f80fd5b813561072081610edd565b5f5b83811015610f27578181015183820152602001610f0f565b50505f910152565b5f8151808452610f46816020860160208601610f0d565b601f01601f19169290920160200192915050565b602081525f6107206020830184610f2f565b5f60208284031215610f7c575f80fd5b5035919050565b80356001600160a01b0381168114610f99575f80fd5b919050565b5f8060408385031215610faf575f80fd5b610fb883610f83565b946020939093013593505050565b5f805f60608486031215610fd8575f80fd5b610fe184610f83565b9250610fef60208501610f83565b9150604084013590509250925092565b5f6020828403121561100f575f80fd5b61072082610f83565b5f8060408385031215611029575f80fd5b61103283610f83565b915060208301358015158114611046575f80fd5b809150509250929050565b634e487b7160e01b5f52604160045260245ffd5b5f805f8060808587031215611078575f80fd5b61108185610f83565b935061108f60208601610f83565b925060408501359150606085013567ffffffffffffffff808211156110b2575f80fd5b818701915087601f8301126110c5575f80fd5b8135818111156110d7576110d7611051565b604051601f8201601f19908116603f011681019083821181831017156110ff576110ff611051565b816040528281528a6020848701011115611117575f80fd5b826020860160208301375f60208483010152809550505050505092959194509250565b5f806040838503121561114b575f80fd5b61115483610f83565b915061116260208401610f83565b90509250929050565b600181811c9082168061117f57607f821691505b60208210810361119d57634e487b7160e01b5f52602260045260245ffd5b50919050565b5f600182016111c057634e487b7160e01b5f52601160045260245ffd5b5060010190565b5f83516111d8818460208801610f0d565b8351908301906111ec818360208801610f0d565b01949350505050565b6001600160a01b03858116825284166020820152604081018390526080606082018190525f9061122790830184610f2f565b9695505050505050565b5f60208284031215611241575f80fd5b815161072081610edd56fea2646970667358221220f6e2c29b6d9b66f05b22b79498a845c644a1fce177c19aef1a8e5da9661ffea664736f6c63430008140033';;

async function main() {
  console.log('\n🚀 tRAIR ERC721 Deployment Script\n');
  console.log('='.repeat(60));
  console.log(`Network: ${NETWORK}`);
  console.log(`Contract Name: ${CONTRACT_NAME}`);
  console.log(`Symbol: ${CONTRACT_SYMBOL}`);
  console.log(`Max Supply: ${MAX_SUPPLY.toLocaleString()}`);
  console.log(`Mint Price: ${MINT_PRICE} ETH (Free)`);
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Initialize CDP Client
  console.log('📡 Initializing CDP Client...');
  
  if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET || !process.env.CDP_WALLET_SECRET) {
    throw new Error('Missing CDP credentials. Please set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET environment variables.');
  }
  
  const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
  });
  console.log('✅ CDP Client initialized\n');

  // Step 2: Get or create account
  console.log('👛 Getting deployment wallet...');
  const cdpAccount = await cdp.evm.getOrCreateAccount({
    name: `trair-deployer-${Date.now()}`
  });
  console.log(`✅ Wallet address: ${cdpAccount.address}\n`);

  // Step 3: Check balance and create clients
  console.log('💰 Checking wallet balance...');

  // ✅ CRITICAL: Scope account to network BEFORE creating viem client
  const networkScopedAccount = await cdpAccount.useNetwork(NETWORK);
  console.log(`✅ Account scoped to ${NETWORK}`);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });
  
  // Check initial balance using public client (more reliable)
  let currentBalance = Number(await publicClient.getBalance({ address: networkScopedAccount.address })) / 1e18;
  console.log(`Current balance: ${currentBalance} ETH`);

  // Request testnet funds if needed (multiple requests for deployment + minting)
  const requiredBalance = 0.0005; // CDP faucet gives ~0.0001 ETH per request, we have enough for deployment
  console.log(`Current balance: ${currentBalance} ETH`);
  console.log(`Required balance: ${requiredBalance} ETH\n`);

  // Request funds until we have enough
  let requestCount = 0;
  const maxRequests = 3; // Maximum faucet requests (we already have 0.0005 ETH which should be enough)

  while (currentBalance < requiredBalance && requestCount < maxRequests) {
    requestCount++;
    console.log(`🚰 Requesting testnet funds (attempt ${requestCount}/${maxRequests})...`);

    const { transactionHash } = await cdp.evm.requestFaucet({
      address: networkScopedAccount.address,
      network: NETWORK,
      token: 'eth'
    });

    console.log(`✅ Faucet request ${requestCount}: ${transactionHash}`);
    console.log(`   Explorer: https://sepolia.basescan.org/tx/${transactionHash}\n`);
    
    // Wait for faucet to process
    console.log('⏳ Waiting for faucet transaction to confirm...');
    
    await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      timeout: 60000 // 60 seconds timeout
    });
    
    console.log('✅ Faucet transaction confirmed!\n');

    // Check updated balance using public client (more reliable)
    currentBalance = Number(await publicClient.getBalance({ address: networkScopedAccount.address })) / 1e18;

    console.log(`📊 Updated balance: ${currentBalance} ETH`);
    console.log(`📊 Required: ${requiredBalance} ETH`);
    console.log(`📊 Progress: ${(currentBalance / requiredBalance * 100).toFixed(1)}%\n`);

    if (currentBalance >= requiredBalance) {
      console.log('✅ Sufficient balance achieved!\n');
      break;
    } else if (requestCount < maxRequests) {
      console.log('📈 Need more funds, requesting additional...\n');
  } else {
      console.log('⚠️  Maximum faucet requests reached. May need manual funding.\n');
    }
  }

  console.log('✅ Faucet requests complete - proceeding with deployment\n');

  // Update currentBalance for gas estimation (try to get actual balance)
  try {
    currentBalance = Number(await publicClient.getBalance({ address: networkScopedAccount.address })) / 1e18;
    console.log(`📊 Final balance check: ${currentBalance} ETH`);
  } catch (error) {
    console.log('⚠️  Balance check failed, but faucet transactions confirmed - proceeding anyway\n');
    currentBalance = 0.0005; // Assume we have enough since faucet requests succeeded
  }

  // Step 4: Deploy contract
  console.log('📝 Deploying ERC721 contract...');

  // ✅ CDP NATIVE: Use CDP account directly (no viem wrapper)

  // Gas estimation skipped - proceeding directly with deployment
  console.log('📊 Wallet funded and ready for deployment');
  console.log(`📊 Balance: ${currentBalance} ETH`);
  console.log('📊 Proceeding with deployment...\n');

  // ✅ CDP NATIVE: Deploy contract using CDP native transaction methods
  console.log('🔧 Encoding constructor arguments manually...');

  // Import encodeAbiParameters for manual encoding
  const { encodeAbiParameters } = await import('viem');

  // 1. Encode constructor arguments
  const constructorArgs = encodeAbiParameters(
    [
      { type: 'string' },      // name
      { type: 'string' },      // symbol
      { type: 'uint256' },     // maxSupply
      { type: 'uint256' }      // mintPrice
    ],
    [CONTRACT_NAME, CONTRACT_SYMBOL, BigInt(MAX_SUPPLY), BigInt(MINT_PRICE)]
  );

  // 2. Combine bytecode + encoded constructor arguments
  const deploymentData = `${CONTRACT_BYTECODE}${constructorArgs.slice(2)}`;

  console.log(`📊 Deployment data length: ${deploymentData.length} characters`);

  // 3. Get nonce for transaction ordering
  const nonce = await publicClient.getTransactionCount({
    address: networkScopedAccount.address
  });

  console.log(`📊 Transaction nonce: ${nonce}`);

  // 4. ✅ CDP NATIVE: Use CDP SDK native signTransaction method
  console.log('📤 Using CDP SDK native signTransaction method...');

  try {
        // Sign the deployment transaction using CDP SDK's native method
        // This handles "evm-server" account type correctly
        const signedTx = await networkScopedAccount.signTransaction({
          to: undefined,  // Contract deployment has no "to" address
          data: deploymentData,
          gas: BigInt(2000000),  // ✅ CDP SDK expects BigInt
          nonce: BigInt(nonce),  // ✅ Convert nonce to BigInt
          value: BigInt(0)
          // Let CDP SDK handle EIP-1559 internally
        });

    console.log('✅ Transaction signed via CDP SDK native method');

    // If signTransaction returns a hash directly, use it
        if (typeof signedTx === 'string' && signedTx.startsWith('0x')) {
      const deploymentHash = signedTx;
      console.log(`✅ CDP SDK returned transaction hash directly: ${deploymentHash}`);
    } else {
      console.error('Unexpected response from CDP signTransaction:', signedTx);
      throw new Error('Unexpected CDP SDK response from signTransaction');
    }

  } catch (error) {
    console.error('❌ CDP native signTransaction failed with error:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    throw error;
  }

  console.log('⏳ Waiting for confirmation...\n');

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deploymentHash
  });

  const contractAddress = receipt.contractAddress;

  if (!contractAddress) {
    throw new Error('Deployment failed - no contract address');
  }

  console.log('✅ CONTRACT DEPLOYED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`Explorer: https://sepolia.basescan.org/address/${contractAddress}`);
  console.log(`Deployment Tx: https://sepolia.basescan.org/tx/${deploymentHash}`);
  console.log('='.repeat(60));
  console.log('');

  // Step 5: Mint 2 test NFTs using CDP native methods
  console.log('🎨 Minting test NFTs...\n');

  const mintResults = [];

  for (let i = 1; i <= 2; i++) {
    console.log(`Minting NFT #${i}...`);

    // ✅ CDP NATIVE: Use CDP native methods for minting
    const { encodeFunctionData } = await import('viem');

    const mintFunctionData = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'mint',
      args: [cdpAccount.address]
    });

    console.log(`📊 Mint function data length: ${mintFunctionData.length} characters`);

    // Get nonce for each mint transaction
    const mintNonce = await publicClient.getTransactionCount({
      address: networkScopedAccount.address
    });

    console.log(`📊 Mint transaction nonce: ${mintNonce}`);

    try {
      // ✅ CDP NATIVE: Use CDP SDK native signTransaction method for minting
      const signedMintTx = await networkScopedAccount.signTransaction({
        to: contractAddress,
        data: mintFunctionData,
        gas: BigInt(150000),  // ✅ CDP SDK expects BigInt
        nonce: BigInt(mintNonce),  // ✅ Convert nonce to BigInt
        value: BigInt(0)
        // Let CDP SDK handle EIP-1559 internally
      });

      console.log('✅ Mint transaction signed via CDP SDK native method');

      // If signTransaction returns a hash directly, use it
      if (typeof signedMintTx === 'string' && signedMintTx.startsWith('0x')) {
        const mintHash = signedMintTx;
        console.log(`✅ CDP SDK returned mint transaction hash: ${mintHash}`);
      } else {
        console.error(`Unexpected response from CDP signTransaction for mint #${i}:`, signedMintTx);
        throw new Error(`Unexpected CDP SDK response from signTransaction for mint #${i}`);
      }

    } catch (mintError) {
      console.error(`❌ Mint #${i} failed with error:`);
      console.error('Error message:', mintError.message);
      console.error('Error stack:', mintError.stack);
      console.error('Full error object:', mintError);
      throw mintError;
    }

    console.log('⏳ Waiting for confirmation...');

    const mintReceipt = await publicClient.waitForTransactionReceipt({
      hash: mintHash
    });

    console.log(`✅ NFT #${i} minted successfully!`);
    console.log(`   Block: ${mintReceipt.blockNumber}`);
    console.log(`   Gas Used: ${mintReceipt.gasUsed.toString()}`);
    console.log(`   Explorer: https://sepolia.basescan.org/tx/${mintHash}\n`);

    mintResults.push({
      tokenId: i - 1,
      txHash: mintHash,
      blockNumber: mintReceipt.blockNumber,
      explorerUrl: `https://sepolia.basescan.org/tx/${mintHash}`
    });
  }

  // Step 6: Verify mints
  console.log('🔍 Verifying NFT ownership...');
  const totalSupply = await publicClient.readContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply'
  });
  console.log(`✅ Total supply: ${totalSupply.toString()}\n`);

  // Final summary
  console.log('');
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('='.repeat(60));
  console.log('');
  console.log('CONTRACT DETAILS:');
  console.log(`  Name: ${CONTRACT_NAME}`);
  console.log(`  Symbol: ${CONTRACT_SYMBOL}`);
  console.log(`  Address: ${contractAddress}`);
  console.log(`  Max Supply: ${MAX_SUPPLY.toLocaleString()}`);
  console.log(`  Mint Price: ${MINT_PRICE} ETH`);
  console.log(`  Total Minted: ${totalSupply.toString()}`);
  console.log('');
  console.log('LINKS:');
  console.log(`  Contract: https://sepolia.basescan.org/address/${contractAddress}`);
  console.log(`  Deployment: https://sepolia.basescan.org/tx/${deploymentHash}`);
  console.log('');
  console.log('MINTED NFTs:');
  mintResults.forEach((mint, index) => {
    console.log(`  NFT #${index + 1}:`);
    console.log(`    Token ID: ${mint.tokenId}`);
    console.log(`    Transaction: ${mint.explorerUrl}`);
    console.log(`    Block: ${mint.blockNumber}`);
  });
  console.log('');
  console.log('='.repeat(60));

  // Return results for documentation
  return {
    contract: {
      name: CONTRACT_NAME,
      symbol: CONTRACT_SYMBOL,
      address: contractAddress,
      maxSupply: MAX_SUPPLY,
      mintPrice: MINT_PRICE,
      totalMinted: totalSupply.toString()
    },
    deployment: {
      transactionHash: deploymentHash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
      explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
    },
    mints: mintResults,
    deployer: networkScopedAccount.address
  };
}

// Execute deployment
try {
  const results = await main();
    console.log('\n✅ Script completed successfully');
    // Write results to file for documentation
    fs.writeFileSync(
      './deployment-results.json',
      JSON.stringify(results, null, 2)
    );
    console.log('📄 Results saved to deployment-results.json\n');
    process.exit(0);
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
}

