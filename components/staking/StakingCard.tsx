'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Lock, CheckCircle, BookOpen } from 'lucide-react';

interface StakingStatus {
  rair_balance: number;
  rair_staked: number;
  has_superguide_access: boolean;
}

export function StakingCard() {
  const [stakingStatus, setStakingStatus] = useState<StakingStatus>({
    rair_balance: 0,
    rair_staked: 0,
    has_superguide_access: false
  });
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch staking status
  const fetchStakingStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const response = await fetch('/api/staking/status');

      if (response.ok) {
        const data = await response.json();
        setStakingStatus(data);
      } else if (response.status === 401) {
        // User not authenticated, this is expected for initial load
        return;
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to load staking status'
        });
      }
    } catch (error) {
      console.error('Error fetching staking status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStakingStatus();
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle stake
  const handleStake = async () => {
    const stakeAmount = parseInt(amount);

    if (!stakeAmount || stakeAmount <= 0) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid amount greater than 0.'
      });
      return;
    }

    if (stakeAmount > stakingStatus.rair_balance) {
      setMessage({
        type: 'error',
        text: "You don't have enough RAIR tokens to stake this amount."
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: stakeAmount }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStakingStatus({
          rair_balance: data.rair_balance,
          rair_staked: data.rair_staked,
          has_superguide_access: data.rair_staked >= 3000
        });
        setAmount('');

        setMessage({
          type: 'success',
          text: `Successfully staked ${stakeAmount.toLocaleString()} RAIR tokens.`
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to stake RAIR tokens.'
        });
      }
    } catch (error) {
      console.error('Staking error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred while staking. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unstake
  const handleUnstake = async () => {
    const unstakeAmount = parseInt(amount);

    if (!unstakeAmount || unstakeAmount <= 0) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid amount greater than 0.'
      });
      return;
    }

    if (unstakeAmount > stakingStatus.rair_staked) {
      setMessage({
        type: 'error',
        text: "You don't have enough staked RAIR to unstake this amount."
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/staking/unstake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: unstakeAmount }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStakingStatus({
          rair_balance: data.rair_balance,
          rair_staked: data.rair_staked,
          has_superguide_access: data.rair_staked >= 3000
        });
        setAmount('');

        setMessage({
          type: 'success',
          text: `Successfully unstaked ${unstakeAmount.toLocaleString()} RAIR tokens.`
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to unstake RAIR tokens.'
        });
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred while unstaking. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick stake 3000
  const handleQuickStake = () => {
    if (stakingStatus.rair_balance >= 3000) {
      setAmount('3000');
    } else {
      setMessage({
        type: 'error',
        text: 'You need at least 3,000 RAIR tokens to use quick stake.'
      });
    }
  };

  const progressPercentage = stakingStatus.rair_staked > 0
    ? Math.min((stakingStatus.rair_staked / 3000) * 100, 100)
    : 0;

  if (isLoadingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            RAIR Staking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          RAIR Staking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'error'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold">
              {stakingStatus.rair_balance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">RAIR</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Staked</div>
            <div className="text-2xl font-bold">
              {stakingStatus.rair_staked.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">RAIR</div>
          </div>
        </div>

        {/* Super Guide Access Badge */}
        <div className="flex justify-center">
          {stakingStatus.has_superguide_access ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Super Guide Access Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Lock className="h-3 w-3 mr-1" />
              Super Guide Locked
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Super Guide Access</span>
            <span>{stakingStatus.rair_staked.toLocaleString()} / 3,000 RAIR</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage >= 100
                  ? 'bg-green-500'
                  : progressPercentage >= 66
                  ? 'bg-blue-500'
                  : progressPercentage >= 33
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {stakingStatus.rair_staked < 3000 && (
            <div className="text-xs text-muted-foreground text-center">
              {3000 - stakingStatus.rair_staked > 0
                ? `${(3000 - stakingStatus.rair_staked).toLocaleString()} RAIR more needed`
                : 'Complete!'
              }
            </div>
          )}
        </div>

        {/* Super Guide Access Button */}
        <Link href="/superguide" className="block">
          <Button 
            disabled={!stakingStatus.has_superguide_access}
            className="w-full"
            variant={stakingStatus.has_superguide_access ? "default" : "outline"}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {stakingStatus.has_superguide_access ? '📚 Access Super Guide' : '🔒 Super Guide Locked'}
          </Button>
        </Link>

        {/* Stake/Unstake Controls */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={stakingStatus.rair_staked > 0 ? stakingStatus.rair_staked : stakingStatus.rair_balance}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                onClick={handleQuickStake}
                disabled={stakingStatus.rair_balance < 3000 || isLoading}
                className="whitespace-nowrap"
              >
                Quick Stake 3000
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleStake}
              disabled={
                isLoading ||
                !amount ||
                parseInt(amount) <= 0 ||
                parseInt(amount) > stakingStatus.rair_balance
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stake
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleUnstake}
              disabled={
                isLoading ||
                !amount ||
                parseInt(amount) <= 0 ||
                parseInt(amount) > stakingStatus.rair_staked
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unstaking...
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Unstake
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>💡 Stake 3,000 RAIR tokens to unlock Super Guide access</div>
          {stakingStatus.rair_staked < 3000 && (
            <div>📊 {stakingStatus.rair_staked > 0 ? `${Math.round(progressPercentage)}% complete` : 'Get started by staking RAIR tokens'}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
