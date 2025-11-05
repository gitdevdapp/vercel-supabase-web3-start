import { baseSepolia } from "viem/chains";
import { CdpClient } from "@coinbase/cdp-sdk";
import { env } from "./env";

/**
 * Get the safe chain configuration for the current network
 * Returns baseSepolia chain for viem clients
 */
export function getChainSafe() {
  return baseSepolia;
}

/**
 * Get or create a CDP client instance
 */
function getCdpClient(): CdpClient {
  if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET || !env.CDP_WALLET_SECRET) {
    throw new Error("CDP credentials not configured");
  }

  return new CdpClient({
    apiKeyId: env.CDP_API_KEY_ID,
    apiKeySecret: env.CDP_API_KEY_SECRET,
    walletSecret: env.CDP_WALLET_SECRET,
  });
}

/**
 * Get or create the purchaser account
 * This creates a named CDP account for purchaser operations
 */
export async function getOrCreatePurchaserAccount() {
  const cdp = getCdpClient();
  return await cdp.evm.getOrCreateAccount({ name: "purchaser" });
}

/**
 * Get or create the seller account
 * This creates a named CDP account for seller operations
 */
export async function getOrCreateSellerAccount() {
  const cdp = getCdpClient();
  return await cdp.evm.getOrCreateAccount({ name: "seller" });
}
