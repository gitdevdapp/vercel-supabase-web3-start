'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { type Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { Camera, FileText, ChevronDown, ChevronUp, Copy, Loader2, AlertCircle, CheckCircle2, TrendingUp, Droplet, RefreshCw } from "lucide-react";
import { ProfileImageUploader } from "@/components/profile-image-uploader";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";

interface UnifiedProfileWalletCardProps {
  profile: Profile;
  userEmail: string;
}

interface WalletData {
  id: string;
  wallet_address: string;
  wallet_name: string;
  network: string;
  balances?: {
    eth: number;
    usdc: number;
  };
}

interface FaucetStatus {
  step: number;
  balance: number;
  timestamp: string;
}

interface SuperFaucetResponse {
  success: boolean;
  requestCount: number;
  startBalance: number;
  finalBalance: number;
  totalReceived: number;
  transactionHashes: string[];
  statusUpdates: FaucetStatus[];
  explorerUrls: string[];
}

export function UnifiedProfileWalletCard({ profile, userEmail }: UnifiedProfileWalletCardProps) {
  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture || profile.avatar_url || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  // Wallet state
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUSDCFunding, setIsUSDCFunding] = useState(false);
  const [usdcFundingError, setUSDCFundingError] = useState<string | null>(null);
  const [balanceRefreshInterval, setBalanceRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [ethBalanceWarning, setEthBalanceWarning] = useState(false);
  const [isETHFunding, setIsETHFunding] = useState(false);
  const [ethFundingError, setETHFundingError] = useState<string | null>(null);
  const [ethFundingSuccess, setETHFundingSuccess] = useState<string | null>(null);

  // Wallet refs
  const autoCreateAttempts = useRef(0);
  const MAX_AUTO_CREATE_ATTEMPTS = 3;
  const loadWalletInProgress = useRef(false);
  const usdcRefreshAttempts = useRef(0);
  const MAX_USDC_REFRESH_ATTEMPTS = 5;

  // Profile handlers
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (aboutMe.length > 1000) {
        setError('About me must be less than 1000 characters');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          about_me: aboutMe.trim() || null,
          profile_picture: profilePicture.trim() || null,
          avatar_url: profilePicture.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update profile. Please try again.');
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAboutMe(profile.about_me || '');
    setProfilePicture(profile.profile_picture || profile.avatar_url || '');
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleImageUpload = (url: string) => {
    setProfilePicture(url);
    setShowUploader(false);
  };

  // Wallet handlers
  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    if (loadWalletInProgress.current) {
      console.log('[UnifiedProfileWalletCard] loadWallet already in progress, skipping');
      return;
    }
    
    loadWalletInProgress.current = true;
    console.log('[UnifiedProfileWalletCard] loadWallet starting...');
    try {
      setWalletLoading(true);
      setWalletError(null);
      
      const response = await fetch('/api/wallet/list');
      console.log('[UnifiedProfileWalletCard] /api/wallet/list response:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to load wallet: ${response.status}`);
      }

      const data = await response.json();
      console.log('[UnifiedProfileWalletCard] Response data:', data);

      if (data.wallets && data.wallets.length > 0) {
        console.log('[UnifiedProfileWalletCard] Found wallets:', data.wallets.length);
        const firstWallet = data.wallets[0];

        let ethBalance = 0;
        let usdcBalance = 0;

        try {
          const balanceResponse = await fetch(`/api/wallet/balance?address=${firstWallet.address}&t=${Date.now()}`);
          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            ethBalance = balanceData.eth || 0;
            usdcBalance = balanceData.usdc || 0;
            console.log('[UnifiedProfileWalletCard] Real-time balances loaded:', { eth: ethBalance, usdc: usdcBalance });
          } else {
            console.warn('[UnifiedProfileWalletCard] Balance API failed, using database balances');
            ethBalance = firstWallet.balances?.eth || 0;
            usdcBalance = firstWallet.balances?.usdc || 0;
          }
        } catch (err) {
          console.error('[UnifiedProfileWalletCard] Error fetching real-time balances:', err);
          ethBalance = firstWallet.balances?.eth || 0;
          usdcBalance = firstWallet.balances?.usdc || 0;
        }

        const walletData = {
          id: firstWallet.id,
          wallet_address: firstWallet.address,
          wallet_name: firstWallet.name,
          network: firstWallet.network || 'base-sepolia',
          balances: {
            eth: ethBalance,
            usdc: usdcBalance
          }
        };
        console.log('[UnifiedProfileWalletCard] Setting wallet data:', walletData);
        setWallet(walletData);
        autoCreateAttempts.current = 0;
        setEthBalanceWarning(ethBalance >= 0.01); // Set warning if balance is very low
      } else {
        console.log('[UnifiedProfileWalletCard] No wallets found');
        
        if (autoCreateAttempts.current >= MAX_AUTO_CREATE_ATTEMPTS) {
          console.error('[UnifiedProfileWalletCard] Max auto-create attempts exceeded');
          setWalletError('Unable to create wallet after multiple attempts. Please try again later.');
          setWallet(null);
        } else {
          console.log(`[UnifiedProfileWalletCard] Triggering auto-create (attempt ${autoCreateAttempts.current + 1}/${MAX_AUTO_CREATE_ATTEMPTS})`);
          autoCreateAttempts.current++;

          try {
            const createResponse = await fetch('/api/wallet/auto-create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              console.log('[UnifiedProfileWalletCard] Auto-create successful:', createData);

              if (createData.created) {
                console.log('[UnifiedProfileWalletCard] Wallet created, reloading in 1 second...');
                setTimeout(() => {
                  loadWalletInProgress.current = false;
                  loadWallet();
                }, 1000);
                return;
              } else {
                console.warn('[UnifiedProfileWalletCard] Auto-create returned created: false, wallet may already exist');
                setTimeout(() => {
                  loadWalletInProgress.current = false;
                  loadWallet();
                }, 500);
                return;
              }
            } else {
              console.error('[UnifiedProfileWalletCard] Auto-create failed with status:', createResponse.status);
              const errorData = await createResponse.json();
              console.error('[UnifiedProfileWalletCard] Auto-create error:', errorData);
              setWalletError(errorData.error || 'Failed to create wallet');
            }
          } catch (createErr) {
            console.error('[UnifiedProfileWalletCard] Auto-create error:', createErr);
            setWalletError('Failed to create wallet: ' + (createErr instanceof Error ? createErr.message : 'Unknown error'));
          }
        }
      }
    } catch (err) {
      console.error('[UnifiedProfileWalletCard] Error loading wallet:', err);
      setWalletError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      console.log('[UnifiedProfileWalletCard] loadWallet finally - ensuring loading is false');
      loadWalletInProgress.current = false;
      setWalletLoading(false);
    }
  };

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.wallet_address);
      console.log('Address copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const triggerAutoFaucet = async () => {
    if (!wallet) return;
    console.log('[UnifiedProfileWalletCard] Triggering auto-superfaucet...');

    setIsETHFunding(true);
    setETHFundingError(null);
    setETHFundingSuccess(null);

    try {
      const response = await fetch('/api/wallet/auto-superfaucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet.wallet_address })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[UnifiedProfileWalletCard] Auto-faucet result:', result);

        // 🔴 CRITICAL: Validate actual faucet requests were made
        if (result.success && !result.skipped) {
          // Verify at least one request was successful
          if (!result.requestCount || result.requestCount === 0) {
            console.error('[UnifiedProfileWalletCard] ❌ Response claims success but requestCount is 0!');
            throw new Error('Faucet returned success but made no actual requests');
          }

          console.log('[UnifiedProfileWalletCard] ✅ Valid success: Got transaction from faucet', result.transactionHashes?.[0]);
          setSuccess(`🚀 ETH faucet request submitted! Your balance will update within 30 seconds.`);
        } else if (result.skipped) {
          console.log('[UnifiedProfileWalletCard] ℹ️ Wallet already funded, skipping');
          setSuccess('ℹ️ Wallet already has sufficient balance (≥0.01 ETH). No additional funding needed.');
          setIsETHFunding(false);
          return;
        }

        // Wait for blockchain to settle, then reload
        setTimeout(() => {
          loadWallet();
          setIsETHFunding(false);
          setETHFundingSuccess('✅ ETH faucet completed successfully!');
          setTimeout(() => setETHFundingSuccess(null), 5000);
        }, 2000);
        return;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Auto-superfaucet request failed');
      }
    } catch (err) {
      console.error('[UnifiedProfileWalletCard] ❌ Auto-superfaucet failed:', err);

      setIsETHFunding(false);

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('Faucet rate limit')) {
        setETHFundingError('⏰ Faucet rate limit exceeded. Please wait 24 hours before requesting more ETH.');
      } else if (errorMessage.includes('No ETH received') || errorMessage.includes('no actual requests')) {
        setETHFundingError('⚠️ Faucet service temporarily unavailable. Please try again in a few moments.');
      } else {
        setETHFundingError(`Failed to request ETH: ${errorMessage}`);
      }

      setTimeout(() => setETHFundingError(null), 10000);
    }
  };

  const triggerUSDCFaucet = async () => {
    if (!wallet) return;
    console.log('[UnifiedProfileWalletCard] Triggering USDC faucet...');
    try {
      setIsUSDCFunding(true);
      setUSDCFundingError(null);

      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.wallet_address,
          token: 'usdc'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for limit errors (from server-side detection)
        if (errorData.type === 'FAUCET_LIMIT' || 
            (response.status === 429) ||
            (errorData.error && (errorData.error.includes('Limit') || errorData.error.includes('limit')))) {
          throw new Error(errorData.error || 'Global 10 USDC Limit per 24 Hours - Use our Guide to get your own CDP Keys');
        }
        
        throw new Error(errorData.error || 'Failed to fund USDC');
      }

      const result = await response.json();
      console.log('[UnifiedProfileWalletCard] USDC faucet result:', result);

      setTimeout(() => {
        loadWallet();
        setTimeout(() => loadWallet(), 3000);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fund USDC';
      console.error('[UnifiedProfileWalletCard] USDC faucet error:', errorMessage);
      setUSDCFundingError(errorMessage);
    } finally {
      setIsUSDCFunding(false);
    }
  };

  const startAutoRefresh = useRef(() => {
    console.log('[UnifiedProfileWalletCard] Auto-refresh starting, will attempt 5 times every 5 seconds');
    usdcRefreshAttempts.current = 0;
    const interval = setInterval(() => {
      usdcRefreshAttempts.current++;
      console.log(`[UnifiedProfileWalletCard] Auto-refresh attempt ${usdcRefreshAttempts.current}/${MAX_USDC_REFRESH_ATTEMPTS}`);
      loadWallet();
      
      if (usdcRefreshAttempts.current >= MAX_USDC_REFRESH_ATTEMPTS) {
        console.log('[UnifiedProfileWalletCard] Auto-refresh complete after 5 attempts');
        clearInterval(interval);
        setBalanceRefreshInterval(null);
      }
    }, 5000);
    
    setBalanceRefreshInterval(interval);
  }).current;

  useEffect(() => {
    if (isUSDCFunding && wallet) {
      console.log('[UnifiedProfileWalletCard] USDC funding started, scheduling auto-refresh...');
      const timeoutId = setTimeout(() => {
        console.log('[UnifiedProfileWalletCard] Starting auto-refresh sequence...');
        startAutoRefresh();
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isUSDCFunding, wallet, startAutoRefresh]);

  useEffect(() => {
    return () => {
      if (balanceRefreshInterval) {
        console.log('[UnifiedProfileWalletCard] Cleaning up balance refresh interval on unmount');
        clearInterval(balanceRefreshInterval);
      }
    };
  }, [balanceRefreshInterval]);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardContent className="pt-6 space-y-6">
        {/* ===== PROFILE SECTION ===== */}
        
        {/* Profile Header - Always Visible */}
        <div className="flex items-center gap-6">
          <Avatar 
            src={profilePicture || profile.profile_picture || profile.avatar_url}
            alt={profile.username || userEmail}
            fallbackText={profile.username || userEmail}
            size="md"
            className="ring-2 ring-background shadow-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {profile.username || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Edit Profile Button - Toggles Expansion */}
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="w-full"
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>
              Collapse <ChevronUp className="ml-2 w-4 h-4" />
            </>
          ) : (
            <>
              Edit Profile <ChevronDown className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>

        {/* Expandable Profile Edit Content */}
        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            {/* Profile Picture Upload Section */}
            {showUploader ? (
              <div className="p-4 rounded-lg border bg-card">
                <ProfileImageUploader
                  userId={profile.id}
                  currentImageUrl={profilePicture || profile.profile_picture || profile.avatar_url}
                  username={profile.username || userEmail}
                  onUploadComplete={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="profile_picture" className="text-sm font-medium">
                      Profile Picture
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploader(true)}
                    disabled={isLoading}
                  >
                    Upload Image
                  </Button>
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      id="profile_picture"
                      type="url"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to your profile picture, or use &ldquo;Upload Image&rdquo; above
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-md border bg-muted text-sm break-all">
                    {profilePicture || 'No profile picture set'}
                  </div>
                )}
              </div>
            )}

            {/* About Me Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="about_me" className="text-sm font-medium">
                  About Me
                </Label>
              </div>
              <div className="space-y-2">
                <textarea
                  id="about_me"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={1000}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {aboutMe.length}/1000 characters
                  </p>
                  {aboutMe.length > 900 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {1000 - aboutMe.length} characters remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800 flex items-start gap-2">
                <span className="text-lg">✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ===== WALLET SECTION ===== */}
        <div className="border-t pt-6">
          {/* Wallet Loading State */}
          {walletLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-muted-foreground">Loading wallet information...</span>
              </div>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Initializing your wallet...</p>
                </div>
              </div>
            </div>
          ) : walletError ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="font-semibold">Wallet Error</span>
              </div>
              <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-destructive">{walletError}</div>
              </div>
              <Button onClick={loadWallet} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          ) : !wallet ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Generating your wallet automatically...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Wallet Header */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-semibold">My Wallet</h3>
                  <p className="text-xs text-muted-foreground">Your Web3 wallet on Base Sepolia</p>
                </div>
              </div>

              {/* Wallet Address Section */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Wallet Address</div>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-muted border border-input">
                    <code className="text-xs sm:text-sm font-mono break-all text-foreground">
                      {wallet.wallet_address}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Balances Header with Refresh Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Current Balances</div>
                <Button
                  onClick={loadWallet}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-muted"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>

              {/* Balances Grid with Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">ETH Balance</div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                    <p className="text-lg font-semibold text-foreground">
                      {wallet.balances?.eth?.toFixed(6) || '0.000000'}
                    </p>
                    <p className="text-xs text-muted-foreground">ETH</p>
                  </div>
                  {ethBalanceWarning && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-700 dark:text-blue-300">
                      ℹ️ You already have {wallet.balances?.eth?.toFixed(6)} ETH, which exceeds the faucet limit of 0.01 ETH per request.
                    </div>
                  )}
                  <Button
                    onClick={triggerAutoFaucet}
                    disabled={ethBalanceWarning || isETHFunding}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isETHFunding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Requesting ETH...
                      </>
                    ) : (
                      <>
                        <Droplet className="w-4 h-4 mr-2" />
                        Request ETH
                      </>
                    )}
                  </Button>
                  
                  {/* ETH Funding Error Display */}
                  {ethFundingError && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-xs text-red-600">
                      {ethFundingError}
                    </div>
                  )}
                  
                  {/* ETH Funding Success Display */}
                  {ethFundingSuccess && (
                    <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded text-xs text-green-600">
                      {ethFundingSuccess}
                    </div>
                  )}
                  
                  {/* ETH Faucet Description */}
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-700 dark:text-blue-300">
                    Requesting ETH repeatedly asks Coinbase API for funds until 0.01 ETH balance is reached. You can use this balance to test the system
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">USDC Balance</div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <p className="text-lg font-semibold text-foreground">
                      ${wallet.balances?.usdc?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">USDC</p>
                  </div>
                  <Button
                    onClick={triggerUSDCFaucet}
                    disabled={isUSDCFunding}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUSDCFunding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      "Request USDC"
                    )}
                  </Button>
                </div>
              </div>

              {/* Funding Controls - Simple Buttons */}
              <div className="space-y-2 border-t pt-4">
                {usdcFundingError && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-xs text-red-600">
                    {usdcFundingError}
                  </div>
                )}
              </div>

              {/* Transaction History - Collapsible */}
              <div className="space-y-3 border-t pt-4">
                <Button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  variant="outline"
                  className="w-full flex justify-between items-center"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    📊 Transaction History
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isHistoryOpen && (
                  <div className="mt-4">
                    <TransactionHistory walletId={wallet.id} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
