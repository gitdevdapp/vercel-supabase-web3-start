# Scaffold-ETH 2 Hooks Documentation

Scaffold-ETH 2 provides a comprehensive set of React hooks for interacting with smart contracts. These hooks are built on top of Wagmi and provide type-safe, easy-to-use interfaces for common Web3 operations.

## 📋 Hook Categories

### Contract Interaction Hooks
- `useScaffoldContract` - Get contract instance
- `useScaffoldReadContract` - Read contract data
- `useScaffoldWriteContract` - Write to contracts
- `useScaffoldWatchContractEvent` - Watch contract events
- `useScaffoldEventHistory` - Get historical events

### Utility Hooks
- `useTransactor` - Transaction management with UI feedback
- `useDeployedContractInfo` - Contract metadata
- `useGlobalState` - Global application state

## 🔧 Contract Interaction Hooks

### useScaffoldContract

Get a contract instance for direct interaction with contract methods.

```typescript
import { useScaffoldContract } from '~~/hooks/scaffold-eth';

function MyComponent() {
  const { data: contract } = useScaffoldContract({
    contractName: 'MyContract',
    walletClient, // Optional: for write operations
  });

  const handleDirectCall = async () => {
    if (contract) {
      // Read operation
      const balance = await contract.read.balanceOf([userAddress]);

      // Write operation (requires walletClient)
      await contract.write.mint([amount]);
    }
  };

  return <button onClick={handleDirectCall}>Direct Call</button>;
}
```

**Parameters:**
- `contractName` (string): Name of the deployed contract
- `walletClient` (optional): Wallet client for write operations
- `chainId` (optional): Target chain ID

### useScaffoldReadContract

Read data from smart contract functions with automatic caching and refetching.

```typescript
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';

function TokenBalance({ userAddress }: { userAddress: string }) {
  const { data: balance, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: 'MyToken',
    functionName: 'balanceOf',
    args: [userAddress],
    watch: true, // Auto-refetch on new blocks
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Balance: {balance?.toString()}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

**Parameters:**
- `contractName` (string): Contract name
- `functionName` (string): Function to call
- `args` (optional): Function arguments
- `watch` (optional, boolean): Auto-refetch on new blocks (default: true)
- `chainId` (optional): Target chain ID

**Returns:**
- `data`: Function return value
- `isLoading`: Loading state
- `error`: Error object if failed
- `refetch`: Manual refetch function

### useScaffoldWriteContract

Execute write operations on smart contracts with built-in transaction management.

```typescript
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { parseEther } from 'viem';

function MintButton({ amount }: { amount: string }) {
  const { writeContractAsync, isPending, error } = useScaffoldWriteContract({
    contractName: 'MyToken',
  });

  const handleMint = async () => {
    try {
      await writeContractAsync({
        functionName: 'mint',
        args: [parseEther(amount)],
        value: parseEther('0.01'), // ETH value for payable functions
      });
      // Transaction successful
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={isPending}
      className="btn btn-primary"
    >
      {isPending ? 'Minting...' : 'Mint Token'}
    </button>
  );
}
```

**Parameters:**
- `contractName` (string): Contract name
- `chainId` (optional): Target chain ID

**Write Parameters:**
- `functionName` (string): Function to call
- `args` (optional): Function arguments
- `value` (optional, bigint): ETH value for payable functions
- `onBlockConfirmation` (optional): Callback when transaction confirms

**Returns:**
- `writeContractAsync`: Function to execute transaction
- `isPending`: Transaction pending state
- `error`: Error object if failed

### useScaffoldWatchContractEvent

Subscribe to real-time contract events and execute callbacks when events are emitted.

```typescript
import { useScaffoldWatchContractEvent } from '~~/hooks/scaffold-eth';

function EventListener() {
  useScaffoldWatchContractEvent({
    contractName: 'MyToken',
    eventName: 'Transfer',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { from, to, value } = log.args;
        console.log(`Transfer: ${from} → ${to} (${value} tokens)`);

        // Update UI state
        updateBalance(to);
      });
    },
  });

  return <div>Listening for transfer events...</div>;
}
```

**Parameters:**
- `contractName` (string): Contract name
- `eventName` (string): Event name to watch
- `onLogs` (function): Callback function for event logs
- `chainId` (optional): Target chain ID

### useScaffoldEventHistory

Fetch historical contract events with filtering and pagination.

```typescript
import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';

function EventHistory({ contractAddress }: { contractAddress: string }) {
  const {
    data: events,
    isLoading,
    error,
    fetchMore,
    hasNextPage
  } = useScaffoldEventHistory({
    contractName: 'MyToken',
    eventName: 'Transfer',
    fromBlock: 1000000n,
    toBlock: 2000000n,
    filters: {
      from: contractAddress, // Filter events from specific address
    },
    blockData: true,      // Include block information
    transactionData: true, // Include transaction data
    receiptData: true,    // Include receipt data
  });

  if (isLoading) return <div>Loading events...</div>;

  return (
    <div>
      {events?.map((event, index) => (
        <div key={index}>
          Block: {event.blockNumber}
          Transaction: {event.transactionHash}
          {JSON.stringify(event.args)}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchMore()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

**Parameters:**
- `contractName` (string): Contract name
- `eventName` (string): Event name
- `fromBlock` (bigint): Starting block number
- `toBlock` (optional, bigint): Ending block number
- `filters` (optional): Event filters by indexed parameters
- `blockData` (optional, boolean): Include block data
- `transactionData` (optional, boolean): Include transaction data
- `receiptData` (optional, boolean): Include receipt data
- `watch` (optional, boolean): Auto-refetch on new blocks

## 🛠️ Utility Hooks

### useTransactor

Manage transactions with built-in UI feedback, error handling, and confirmation dialogs.

```typescript
import { useTransactor } from '~~/hooks/scaffold-eth';
import { parseEther } from 'viem';

function TransactionExample() {
  const writeTx = useTransactor();

  const handleComplexTransaction = async () => {
    await writeTx(
      {
        to: '0x1234...',
        value: parseEther('1.0'),
        data: '0x', // Transaction data
      },
      {
        blockConfirmations: 3, // Wait for 3 confirmations
        onBlockConfirmation: (receipt) => {
          console.log('Transaction confirmed!', receipt);
          // Update UI, show success message, etc.
        },
      }
    );
  };

  return (
    <button onClick={handleComplexTransaction}>
      Send Complex Transaction
    </button>
  );
}
```

**Transaction Parameters:**
- Standard Ethereum transaction parameters (to, value, data, etc.)

**Options:**
- `blockConfirmations` (optional, number): Number of confirmations to wait
- `onBlockConfirmation` (optional, function): Callback on confirmation

### useDeployedContractInfo

Get metadata about deployed contracts including ABI and address.

```typescript
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';

function ContractInfo() {
  const { data: contractInfo, isLoading } = useDeployedContractInfo({
    contractName: 'MyToken',
    chainId: 8453, // Base mainnet
  });

  if (isLoading) return <div>Loading contract info...</div>;

  return (
    <div>
      <p>Contract Address: {contractInfo?.address}</p>
      <p>Chain ID: {contractInfo?.chainId}</p>
      <details>
        <summary>ABI</summary>
        <pre>{JSON.stringify(contractInfo?.abi, null, 2)}</pre>
      </details>
    </div>
  );
}
```

**Parameters:**
- `contractName` (string): Contract name
- `chainId` (optional): Target chain ID

## 🔄 Hook Patterns and Best Practices

### 1. Error Handling

```typescript
function SafeContractCall() {
  const { data, error, isLoading } = useScaffoldReadContract({
    contractName: 'MyContract',
    functionName: 'getData',
  });

  if (error) {
    return <div className="alert alert-error">Error: {error.message}</div>;
  }

  return (
    <div>
      {isLoading ? (
        <div className="loading loading-spinner"></div>
      ) : (
        <div>Data: {data?.toString()}</div>
      )}
    </div>
  );
}
```

### 2. Conditional Hook Usage

```typescript
function ConditionalContractInteraction({ contractName }: { contractName?: string }) {
  const { data: contract } = useScaffoldContract({
    contractName: contractName!,
  });

  // Only call hooks when contractName is available
  if (!contractName) return null;

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName,
  });

  return (
    <button onClick={() => writeContractAsync({ functionName: 'execute' })}>
      Execute
    </button>
  );
}
```

### 3. Memoized Callbacks

```typescript
import { useCallback } from 'react';

function OptimizedContractCalls({ userAddress }: { userAddress: string }) {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: 'MyContract',
  });

  const handleAction = useCallback(async (action: string, amount: string) => {
    await writeContractAsync({
      functionName: action,
      args: [userAddress, parseEther(amount)],
    });
  }, [writeContractAsync, userAddress]);

  return (
    <div>
      <button onClick={() => handleAction('mint', '1.0')}>
        Mint 1.0 Token
      </button>
      <button onClick={() => handleAction('burn', '0.5')}>
        Burn 0.5 Token
      </button>
    </div>
  );
}
```

### 4. Loading States and UX

```typescript
function EnhancedContractInteraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: 'MyContract',
  });

  const handleTransaction = async () => {
    setIsProcessing(true);
    try {
      await writeContractAsync({
        functionName: 'complexOperation',
        onBlockConfirmation: () => {
          setIsProcessing(false);
          // Show success message
        },
      });
    } catch (error) {
      setIsProcessing(false);
      // Show error message
    }
  };

  const isLoading = isPending || isProcessing;

  return (
    <button
      className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
      onClick={handleTransaction}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Processing...
        </>
      ) : (
        'Execute Transaction'
      )}
    </button>
  );
}
```

### 5. Chain-Specific Operations

```typescript
import { useChainId } from 'wagmi';

function MultiChainContract() {
  const chainId = useChainId();
  const { data: balance } = useScaffoldReadContract({
    contractName: 'MultiChainToken',
    functionName: 'balanceOf',
    args: [userAddress],
    chainId, // Use current chain
  });

  return (
    <div>
      <p>Current Chain: {chainId}</p>
      <p>Balance: {balance?.toString()}</p>
    </div>
  );
}
```

## 📊 Performance Optimization

### 1. Debounced Read Operations

```typescript
import { useMemo } from 'react';

function DebouncedContractReads({ userAddress }: { userAddress: string }) {
  const { data: balance } = useScaffoldReadContract({
    contractName: 'Token',
    functionName: 'balanceOf',
    args: [userAddress],
    watch: false, // Disable auto-watch for performance
  });

  // Only refetch when userAddress changes
  const memoizedBalance = useMemo(() => balance, [balance]);

  return <div>Balance: {memoizedBalance?.toString()}</div>;
}
```

### 2. Conditional Watching

```typescript
function SmartEventWatching({ shouldWatch }: { shouldWatch: boolean }) {
  useScaffoldWatchContractEvent({
    contractName: 'Token',
    eventName: 'Transfer',
    onLogs: handleTransfer,
  });

  // Only enable when component is visible
  useScaffoldEventHistory({
    contractName: 'Token',
    eventName: 'Transfer',
    watch: shouldWatch,
  });
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Hook Dependency Warnings**
   ```typescript
   // Fix: Memoize function dependencies
   const handleAction = useCallback(async () => {
     await writeContractAsync({ functionName: 'action' });
   }, [writeContractAsync]);
   ```

2. **Chain Mismatch Errors**
   ```typescript
   // Fix: Ensure chainId matches deployed contract
   const { data } = useScaffoldReadContract({
     contractName: 'MyContract',
     functionName: 'getData',
     chainId: 8453, // Base mainnet
   });
   ```

3. **Missing ABI/Address**
   ```typescript
   // Fix: Verify contract is deployed and configured
   const { data: contractInfo } = useDeployedContractInfo({
     contractName: 'MyContract',
   });
   ```

### Debug Information

```typescript
function DebugContractInfo() {
  const { data: contractInfo } = useDeployedContractInfo({
    contractName: 'MyContract',
  });

  console.log('Contract Info:', contractInfo);

  return (
    <details>
      <summary>Debug Info</summary>
      <pre>{JSON.stringify(contractInfo, null, 2)}</pre>
    </details>
  );
}
```

## 🔄 Migration from Wagmi

If migrating from direct Wagmi usage:

```typescript
// Before: Direct Wagmi
import { useReadContract, useWriteContract } from 'wagmi';

function OldComponent() {
  const { data } = useReadContract({
    address: '0x1234...',
    abi: myAbi,
    functionName: 'balanceOf',
    args: [address],
  });

  const { writeContract } = useWriteContract();

  return <div>{data?.toString()}</div>;
}

// After: Scaffold-ETH
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

function NewComponent() {
  const { data } = useScaffoldReadContract({
    contractName: 'MyContract',
    functionName: 'balanceOf',
    args: [address],
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: 'MyContract',
  });

  return <div>{data?.toString()}</div>;
}
```

## 📚 Further Reading

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)
