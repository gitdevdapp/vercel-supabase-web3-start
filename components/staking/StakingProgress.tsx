'use client';

interface StakingProgressProps {
  currentStaked: number;
  targetAmount?: number;
  className?: string;
}

export function StakingProgress({
  currentStaked,
  targetAmount = 3000,
  className = ''
}: StakingProgressProps) {
  const percentage = Math.min((currentStaked / targetAmount) * 100, 100);
  const remaining = Math.max(targetAmount - currentStaked, 0);

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 66) return 'bg-blue-500';
    if (percentage >= 33) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress to Super Guide Access</span>
        <span className="font-medium">
          {currentStaked.toLocaleString()} / {targetAmount.toLocaleString()} RAIR
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {currentStaked < targetAmount && (
        <div className="text-xs text-muted-foreground text-center">
          {remaining > 0
            ? `${remaining.toLocaleString()} RAIR more needed`
            : 'Complete!'
          }
        </div>
      )}

      {currentStaked >= targetAmount && (
        <div className="text-xs text-green-600 dark:text-green-400 text-center">
          ✅ Super Guide access unlocked!
        </div>
      )}
    </div>
  );
}
