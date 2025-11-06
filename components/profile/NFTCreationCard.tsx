'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle, Shield, Send, Lock } from 'lucide-react';

interface NFTCreationFormData {
  collectionName: string;
  collectionSymbol: string;
  collectionSize: string;
  collectionPrice: string;
}

interface DeploymentResult {
  success: boolean;
  contractAddress: string;
  transactionHash: string;
  explorerUrl: string;
  contract: {
    name: string;
    symbol: string;
    maxSupply: number;
    mintPrice: string;
    network: string;
  };
}

interface DeployerFundingResponse {
  success: boolean;
  transactionHash: string;
  deployer: {
    address: string;
  };
  amount: number;
  message: string;
}

export function NFTCreationCard() {
  const [formData, setFormData] = useState<NFTCreationFormData>({
    collectionName: '',
    collectionSymbol: '',
    collectionSize: '10000',
    collectionPrice: '0',
  });

  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isFundingDeployer, setIsFundingDeployer] = useState(false);
  const [deployerFundingError, setDeployerFundingError] = useState<string | null>(null);
  const [deployerFundingSuccess, setDeployerFundingSuccess] = useState<string | null>(null);
  const [fundingResult, setFundingResult] = useState<DeployerFundingResponse | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [deployerAddress, setDeployerAddress] = useState<string | null>(null);
  const [showFundDeployer, setShowFundDeployer] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetch('/api/wallet/list');
        if (response.ok) {
          const data = await response.json();
          if (data.wallets?.[0]?.address) {
            setUserWallet(data.wallets[0].address);
          }
        }
      } catch (err) {
        console.error('Failed to load wallet:', err);
      }
    };

    const getDeployerAddress = async () => {
      try {
        const response = await fetch('/api/contract/deployer-info');
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setDeployerAddress(data.address);
          }
        }
      } catch (err) {
        console.error('Failed to load deployer info:', err);
      }
    };

    loadWallet();
    getDeployerAddress();
  }, []);

  const handleInputChange = (field: keyof NFTCreationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.collectionName.trim()) {
      setError('Collection Name is required');
      return false;
    }
    if (!formData.collectionSymbol.trim()) {
      setError('Collection Symbol is required');
      return false;
    }
    if (formData.collectionSymbol.length > 10) {
      setError('Symbol must be 10 characters or less');
      return false;
    }
    if (!formData.collectionSize || parseInt(formData.collectionSize) <= 0) {
      setError('Collection Size must be greater than 0');
      return false;
    }
    if (parseFloat(formData.collectionPrice) < 0) {
      setError('Collection Price cannot be negative');
      return false;
    }
    return true;
  };

  const handleDeploy = async () => {
    if (!validateForm()) return;

    setIsDeploying(true);
    setError(null);
    setSuccess(null);
    setDeploymentResult(null);

    try {
      // First, get the user's wallet address
      const walletResponse = await fetch('/api/wallet/list');
      if (!walletResponse.ok) {
        throw new Error('Failed to fetch wallet information');
      }

      const walletData = await walletResponse.json();
      const wallet = walletData.wallets?.[0];

      if (!wallet?.address) {
        setError('No wallet found. Please create a wallet first.');
        setIsDeploying(false);
        return;
      }

      // Convert price from ETH to wei (1 ETH = 10^18 wei) - send as string to avoid precision loss
      const priceInWei = (BigInt(Math.floor(parseFloat(formData.collectionPrice) * 1e18))).toString();

      // Deploy the contract
      const deployResponse = await fetch('/api/contract/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.collectionName,
          symbol: formData.collectionSymbol,
          maxSupply: parseInt(formData.collectionSize),
          mintPrice: priceInWei,
          walletAddress: wallet.address,
        }),
      });

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        let errorMessage = errorData.error || 'Failed to deploy contract';
        
        // Handle validation errors from Zod (details is an array)
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.map((d: { message: string }) => d.message).join(", ");
        }
        // Handle other detailed error messages (details could be a string)
        else if (errorData.details && typeof errorData.details === 'string') {
          errorMessage = errorData.details;
        }
        
        throw new Error(errorMessage);
      }

      const result = await deployResponse.json();
      setDeploymentResult(result);
      setSuccess(`NFT Collection "${formData.collectionName}" deployed successfully!`);

      // ✨ Signal MyCollectionsPreview to refresh
      localStorage.setItem('erc721_deployment_complete', Date.now().toString());
      console.log('✅ Deployment signal sent to MyCollectionsPreview');
      
      // Also dispatch a custom event for same-tab listeners
      window.dispatchEvent(new CustomEvent('erc721_deployment_complete_event'));

      // Reset form after successful deployment
      setTimeout(() => {
        setFormData({
          collectionName: '',
          collectionSymbol: '',
          collectionSize: '10000',
          collectionPrice: '0',
        });
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during deployment';
      setError(errorMessage);
      console.error('Deployment error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleFundDeployer = async () => {
    if (!userWallet) {
      setDeployerFundingError('User wallet not available');
      return;
    }

    setIsFundingDeployer(true);
    setDeployerFundingError(null);
    setDeployerFundingSuccess(null);
    setFundingResult(null);

    try {
      const response = await fetch('/api/wallet/fund-deployer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: userWallet,
          amount: 0.01 // Standard funding amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fund deployer');
      }

      const data = await response.json();
      setFundingResult(data);
      setDeployerFundingSuccess(`✅ Successfully funded deployer with ${data.amount} ETH! Transaction: ${data.transactionHash.slice(0, 10)}...`);

      // Reset after success
      setTimeout(() => {
        setDeployerFundingSuccess(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setDeployerFundingError(errorMessage);
    } finally {
      setIsFundingDeployer(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create NFT Collection</CardTitle>
        <CardDescription>
          Deploy your own ERC721 NFT collection on Base Sepolia testnet
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        {success && (
          <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
            <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
          </div>
        )}

        {deploymentResult && (
          <div className="p-4 bg-muted rounded-md space-y-3 border">
            <div className="font-semibold text-sm">Deployment Details</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Address:</span>
                <code className="bg-background px-2 py-1 rounded font-mono">
                  {deploymentResult.contractAddress?.slice(0, 10)}...
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">Base Sepolia</span>
              </div>
              {deploymentResult.explorerUrl && (
                <a
                  href={deploymentResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs block"
                >
                  View on BaseScan →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Collection Name */}
          <div className="space-y-2">
            <Label htmlFor="collectionName">Collection Name *</Label>
            <Input
              id="collectionName"
              placeholder="e.g., My Awesome NFTs"
              value={formData.collectionName}
              onChange={(e) => handleInputChange('collectionName', e.target.value)}
              disabled={isDeploying}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {formData.collectionName.length}/100 characters
            </p>
          </div>

          {/* Collection Symbol */}
          <div className="space-y-2">
            <Label htmlFor="collectionSymbol">Collection Symbol *</Label>
            <Input
              id="collectionSymbol"
              placeholder="e.g., MYNFT"
              value={formData.collectionSymbol}
              onChange={(e) =>
                handleInputChange('collectionSymbol', e.target.value.toUpperCase().slice(0, 10))
              }
              disabled={isDeploying}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              {formData.collectionSymbol.length}/10 characters (ticker symbol)
            </p>
          </div>

          {/* Collection Size (Max Mint Allowed) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="collectionSize">Collection Size (Max Mint) *</Label>
              <Input
                id="collectionSize"
                type="number"
                placeholder="10000"
                value={formData.collectionSize}
                onChange={(e) => handleInputChange('collectionSize', e.target.value)}
                disabled={isDeploying}
                min="1"
                max="999999"
              />
              <p className="text-xs text-muted-foreground">Maximum NFTs allowed</p>
            </div>

            {/* Collection Price */}
            <div className="space-y-2">
              <Label htmlFor="collectionPrice">Mint Price (ETH) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="collectionPrice"
                  type="number"
                  placeholder="0"
                  value={formData.collectionPrice}
                  onChange={(e) => handleInputChange('collectionPrice', e.target.value)}
                  disabled={isDeploying}
                  min="0"
                  step="0.001"
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground font-mono">Ⓔ</span>
              </div>
              <p className="text-xs text-muted-foreground">Sepolia Base ETH per mint</p>
            </div>
          </div>
        </div>

        {/* Advanced Details Section */}
        <div className="space-y-3 p-4 rounded-lg border bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Advanced Details
            </h3>
            <svg
              className={`w-5 h-5 transition-transform ${showAdvancedDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showAdvancedDetails && (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-md">
                <Shield className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="space-y-2">
                  <p className="font-semibold">🚀 Secure Deployment: ethers.js</p>
                  <div className="space-y-1">
                    <p><strong>How it works:</strong></p>
                    <ol className="list-decimal list-inside space-y-0.5 ml-1">
                      <li>You submit form in browser</li>
                      <li>Server receives request</li>
                      <li><strong>ethers.js</strong> signs with universal deployer wallet on server</li>
                      <li>Transaction broadcasted to Base Sepolia</li>
                      <li>Real contract deployed and verified on BaseScan</li>
                    </ol>
                  </div>
                  <p className="border-t border-emerald-200 dark:border-emerald-800 pt-1 mt-1">
                    🔐 <strong>Private Key: NEVER exposed to browser - stored in server environment only</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
                <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="font-medium">Shared Universal Deployer</p>
                  <p>
                    ✅ <strong>Funding is optional</strong> - only needed if deployer balance is low (~0.005 ETH per deployment)
                  </p>
                  <p>
                    All users share one secure deployer wallet that's funded once for unlimited deployments.
                  </p>
                  <p>
                    <strong>💡 Tip:</strong> Check the "ERC721 Universal Deployer" card above to fund if needed.
                  </p>
                </div>
              </div>

              {/* Fund Deployer Section - Now inside Advanced Details */}
              <div className="space-y-3 p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      💡 Shared Universal Deployer (Optional Funding)
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-200 mt-1">
                      All users share one secure deployer wallet. Funding is optional (~0.005 ETH per deployment).
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowFundDeployer(!showFundDeployer)}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {isFundingDeployer ? "Funding..." : "Fund Now"}
                  </Button>
                </div>

                {showFundDeployer && (
                  <div className="space-y-3 pt-3 border-t border-amber-200 dark:border-amber-900">
                    {deployerFundingError && (
                      <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                        <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-red-700 dark:text-red-300">{deployerFundingError}</div>
                      </div>
                    )}

                    {deployerFundingSuccess && (
                      <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                        <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-green-700 dark:text-green-300">{deployerFundingSuccess}</div>
                      </div>
                    )}

                    {fundingResult && (
                      <div className="text-xs space-y-1 p-2 bg-background rounded border">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{fundingResult.amount} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TX:</span>
                          <a
                            href={`https://sepolia.basescan.org/tx/${fundingResult.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            View →
                          </a>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleFundDeployer}
                      disabled={isFundingDeployer || !userWallet}
                      className="w-full h-9 text-sm"
                    >
                      {isFundingDeployer ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Funding...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-2" />
                          Fund Deployer (0.01 ETH)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Deploy Button */}
        <Button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="w-full h-10 font-semibold"
          size="lg"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying Collection...
            </>
          ) : (
            <>
              Deploy NFT Collection
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
