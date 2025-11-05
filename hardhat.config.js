import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: process.env.CDP_DEPLOYER_PRIVATE_KEY
        ? [process.env.CDP_DEPLOYER_PRIVATE_KEY]
        : []
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
};
