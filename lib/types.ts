/**
 * CDP Account Types for Ethers Integration
 *
 * Simple type that matches what CDP SDK actually returns
 */
export interface CDPNetworkAccount {
  address: string;
  name?: string;
  network: string;
  type: string;
  signTransaction: (tx: any) => Promise<string>;
  signMessage: (parameters: { message: string }) => Promise<string>;
  signTypedData?: (typedData: any) => Promise<string>;
  sendTransaction?: (tx: any) => Promise<any>;
  waitForTransactionReceipt?: (options: any) => Promise<any>;
  listTokenBalances?: () => Promise<any>;
  transfer?: (params: any) => Promise<any>;
  requestFaucet?: (params: any) => Promise<any>;
  useSpendPermission?: (params: any) => Promise<any>;
  deployContract?: (params: any) => Promise<any>;
  writeContract?: (params: any) => Promise<any>;
}
