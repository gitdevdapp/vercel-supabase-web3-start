# Scaffold-ETH 2 Components Documentation

Scaffold-ETH 2 provides a comprehensive set of pre-built React components for common Web3 use cases. These components are built with Tailwind CSS and DaisyUI, providing consistent styling and excellent user experience.

## 📋 Component Categories

### Display Components
- `Address` - Display addresses and ENS names
- `Balance` - Show token balances
- `BlockieAvatar` - Generate blockie avatars

### Input Components
- `AddressInput` - Address input with validation
- `EtherInput` - ETH/USD input with conversion
- `IntegerInput` - Integer input with validation

### Contract Components
- `ContractReadMethods` - Auto-generated read methods
- `ContractWriteMethods` - Auto-generated write methods
- `ContractVariables` - Contract state variables

### Layout Components
- `RainbowKitCustomConnectButton` - Enhanced wallet connection

## 🎨 Display Components

### Address

Display Ethereum addresses and ENS names with copy functionality and block explorer links.

```tsx
import { Address } from '~~/components/scaffold-eth';

function AddressDisplay({ userAddress }: { userAddress: string }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Full address with ENS resolution */}
      <Address address={userAddress} />

      {/* Only ENS or address */}
      <Address address={userAddress} onlyEnsOrAddress={true} />

      {/* Short format */}
      <Address address={userAddress} format="short" />

      {/* Large size */}
      <Address address={userAddress} size="lg" />

      {/* Disable block explorer link */}
      <Address address={userAddress} disableAddressLink={true} />
    </div>
  );
}
```

**Props:**
- `address` (string): Ethereum address or ENS name
- `onlyEnsOrAddress` (optional, boolean): Show only ENS or address, not both
- `format` (optional, string): Address format ("short" | "long")
- `size` (optional, string): Component size ("xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl")
- `disableAddressLink` (optional, boolean): Disable block explorer link

### Balance

Display token balances in both native currency and USD.

```tsx
import { Balance } from '~~/components/scaffold-eth';

function BalanceDisplay({ tokenAddress }: { tokenAddress: string }) {
  return (
    <div className="flex flex-col gap-2">
      {/* ETH balance */}
      <Balance address="0x1234..." />

      {/* Token balance with custom styling */}
      <Balance
        address="0x1234..."
        className="text-2xl font-bold text-primary"
      />

      {/* ERC20 token balance */}
      <Balance
        address="0x1234..."
        tokenAddress={tokenAddress}
      />
    </div>
  );
}
```

**Props:**
- `address` (string): Address to check balance for
- `className` (optional, string): Additional CSS classes
- `tokenAddress` (optional, string): ERC20 token contract address

### BlockieAvatar

Generate visual blockie representations of Ethereum addresses.

```tsx
import { BlockieAvatar } from '~~/components/scaffold-eth';

function AvatarDisplay({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-4">
      {/* Default size */}
      <BlockieAvatar address={address} />

      {/* Custom size */}
      <BlockieAvatar address={address} size={40} />

      {/* With ENS avatar override */}
      <BlockieAvatar
        address={address}
        size={60}
        ensImage="https://example.com/avatar.png"
      />

      {/* In a user profile */}
      <div className="flex items-center gap-3">
        <BlockieAvatar address={address} size={32} />
        <div>
          <Address address={address} format="short" />
          <Balance address={address} />
        </div>
      </div>
    </div>
  );
}
```

**Props:**
- `address` (string): Ethereum address
- `size` (optional, number): Avatar size in pixels (default: 30)
- `ensImage` (optional, string): Override with custom image URL

## 📝 Input Components

### AddressInput

Ethereum address input with validation, ENS resolution, and blockie display.

```tsx
import { AddressInput } from '~~/components/scaffold-eth';

function AddressForm() {
  const [recipient, setRecipient] = useState('');

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Recipient Address</span>
      </label>

      <AddressInput
        value={recipient}
        onChange={setRecipient}
        placeholder="Enter address or ENS name"
        name="recipient"
      />

      {/* Disabled state */}
      <AddressInput
        value={recipient}
        onChange={setRecipient}
        placeholder="Disabled input"
        disabled={true}
      />
    </div>
  );
}
```

**Props:**
- `value` (string): Input value
- `onChange` (function): Change handler function
- `placeholder` (optional, string): Placeholder text
- `name` (optional, string): Form field name
- `disabled` (optional, boolean): Disable input

### EtherInput

Input component for ETH amounts with USD conversion.

```tsx
import { EtherInput } from '~~/components/scaffold-eth';

function EtherForm() {
  const [amount, setAmount] = useState('');

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Amount (ETH)</span>
      </label>

      <EtherInput
        value={amount}
        onChange={setAmount}
        placeholder="0.00"
      />

      {/* With form integration */}
      <EtherInput
        value={amount}
        onChange={setAmount}
        name="ethAmount"
        placeholder="Enter ETH amount"
      />

      {/* Disabled */}
      <EtherInput
        value={amount}
        onChange={setAmount}
        placeholder="Disabled"
        disabled={true}
      />
    </div>
  );
}
```

**Props:**
- `value` (string): Input value (always in ETH)
- `onChange` (function): Change handler function
- `placeholder` (optional, string): Placeholder text
- `name` (optional, string): Form field name
- `disabled` (optional, boolean): Disable input

### IntegerInput

Integer input with validation and convenient multiplier buttons.

```tsx
import { IntegerInput } from '~~/components/scaffold-eth';

function IntegerForm() {
  const [value, setValue] = useState<string | bigint>('');

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Integer Value</span>
      </label>

      <IntegerInput
        value={value}
        onChange={setValue}
        placeholder="Enter integer"
      />

      {/* With error state */}
      <IntegerInput
        value={value}
        onChange={setValue}
        placeholder="Enter integer"
        error={false} // Set to true for error styling
      />

      {/* Disabled */}
      <IntegerInput
        value={value}
        onChange={setValue}
        placeholder="Disabled"
        disabled={true}
      />
    </div>
  );
}
```

**Props:**
- `value` (string | bigint): Input value
- `onChange` (function): Change handler function
- `placeholder` (optional, string): Placeholder text
- `name` (optional, string): Form field name
- `error` (optional, boolean): Error state styling
- `disabled` (optional, boolean): Disable input

### InputBase

Basic input component with consistent styling, used as foundation for other inputs.

```tsx
import { InputBase } from '~~/components/scaffold-eth';

function CustomInput() {
  const [value, setValue] = useState('');

  return (
    <InputBase
      value={value}
      onChange={setValue}
      placeholder="Custom input"
      name="customField"
    />
  );
}
```

**Props:**
- `value` (string): Input value
- `onChange` (function): Change handler function
- `placeholder` (optional, string): Placeholder text
- `name` (optional, string): Form field name
- `error` (optional, boolean): Error state styling
- `disabled` (optional, boolean): Disable input

## 🔗 Contract Components

### ContractReadMethods

Auto-generated components for reading contract functions.

```tsx
import { ContractReadMethods } from '~~/components/scaffold-eth';

function ContractReader({ contractName }: { contractName: string }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Contract Read Methods</h2>

        <ContractReadMethods
          contractName={contractName}
          // Optional: hide certain methods
          hideMethods={['owner', 'symbol']}
        />
      </div>
    </div>
  );
}
```

**Props:**
- `contractName` (string): Name of the contract
- `hideMethods` (optional, string[]): Methods to hide
- `showMethods` (optional, string[]): Methods to show (exclusive with hideMethods)

### ContractWriteMethods

Auto-generated components for writing to contract functions.

```tsx
import { ContractWriteMethods } from '~~/components/scaffold-eth';

function ContractWriter({ contractName }: { contractName: string }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Contract Write Methods</h2>

        <ContractWriteMethods
          contractName={contractName}
          // Optional: only show specific methods
          showMethods={['mint', 'transfer']}
          // Optional: hide methods
          hideMethods={['setOwner']}
        />
      </div>
    </div>
  );
}
```

**Props:**
- `contractName` (string): Name of the contract
- `showMethods` (optional, string[]): Methods to show
- `hideMethods` (optional, string[]): Methods to hide

### ContractVariables

Display contract state variables with real-time updates.

```tsx
import { ContractVariables } from '~~/components/scaffold-eth';

function ContractVariablesDisplay({ contractName }: { contractName: string }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Contract Variables</h2>

        <ContractVariables
          contractName={contractName}
          // Refresh interval in milliseconds
          refreshInterval={30000}
        />
      </div>
    </div>
  );
}
```

**Props:**
- `contractName` (string): Name of the contract
- `refreshInterval` (optional, number): Auto-refresh interval in ms

## 🔐 Wallet Components

### RainbowKitCustomConnectButton

Enhanced wallet connection button with balance display and chain information.

```tsx
import { RainbowKitCustomConnectButton } from '~~/components/scaffold-eth';

function Header() {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
        </div>
        <a className="btn btn-ghost normal-case text-xl">My dApp</a>
      </div>

      <div className="navbar-end">
        {/* Enhanced wallet connection */}
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
}
```

**Features:**
- Balance display in native currency
- Chain name and color coding
- Copy address functionality
- QR code display
- Block explorer links
- Disconnect option

## 🎨 Styling and Theming

All components use Tailwind CSS and DaisyUI for consistent styling:

```tsx
// Custom styled components
function StyledComponents() {
  return (
    <div className="space-y-4">
      {/* Primary theme */}
      <div className="card bg-primary text-primary-content">
        <Address address="0x1234..." />
      </div>

      {/* Secondary theme */}
      <div className="card bg-secondary text-secondary-content">
        <Balance address="0x1234..." />
      </div>

      {/* Error state */}
      <div className="alert alert-error">
        <AddressInput
          value={invalidAddress}
          onChange={setInvalidAddress}
          error={true}
        />
      </div>

      {/* Loading state */}
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  );
}
```

## 🔧 Component Composition

### Complex UI Patterns

```tsx
function UserProfileCard({ user }: { user: User }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <BlockieAvatar address={user.address} size={48} />
          <div>
            <Address address={user.address} size="lg" />
            <Balance address={user.address} className="text-sm opacity-70" />
          </div>
        </div>

        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Transaction Form

```tsx
function TransactionForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Send Transaction</h2>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Recipient</span>
          </label>
          <AddressInput
            value={recipient}
            onChange={setRecipient}
            placeholder="Enter recipient address"
            name="recipient"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Amount</span>
          </label>
          <EtherInput
            value={amount}
            onChange={setAmount}
            placeholder="0.00 ETH"
            name="amount"
          />
        </div>

        <div className="card-actions justify-end">
          <button className="btn btn-primary">
            Send Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Contract Dashboard

```tsx
function ContractDashboard({ contractName }: { contractName: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Contract Information */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Contract Info</h2>
          <ContractVariables contractName={contractName} />
        </div>
      </div>

      {/* Read Methods */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Read Methods</h2>
          <ContractReadMethods contractName={contractName} />
        </div>
      </div>

      {/* Write Methods */}
      <div className="card bg-base-100 shadow-xl md:col-span-2">
        <div className="card-body">
          <h2 className="card-title">Write Methods</h2>
          <ContractWriteMethods
            contractName={contractName}
            showMethods={['mint', 'transfer', 'approve']}
          />
        </div>
      </div>
    </div>
  );
}
```

## 🔄 Responsive Design

Components are fully responsive and work across all device sizes:

```tsx
function ResponsiveLayout() {
  return (
    <div className="container mx-auto px-4">
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 sm:p-6">
            <Address address="0x1234..." size="sm" />
            <Balance address="0x1234..." />
          </div>
        </div>

        {/* Hidden on small screens */}
        <div className="hidden sm:block card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Advanced Features</h3>
          </div>
        </div>
      </div>

      {/* Mobile-optimized form */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body p-4 sm:p-6">
          <div className="form-control">
            <AddressInput
              value={address}
              onChange={setAddress}
              placeholder="Enter address (mobile friendly)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Consistent Styling

```tsx
// ✅ Good: Consistent styling pattern
function ConsistentComponents() {
  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <Address address="0x1234..." />
          <Balance address="0x1234..." />
        </div>
      </div>
    </div>
  );
}
```

### 2. Loading and Error States

```tsx
function RobustComponents() {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Input with error state */}
      <div className="form-control">
        <AddressInput
          value={address}
          onChange={setAddress}
          placeholder="Enter address"
          error={!!error}
        />
      </div>
    </div>
  );
}
```

### 3. Form Integration

```tsx
function FormExample() {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Process transaction
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Recipient</span>
        </label>
        <AddressInput
          value={formData.recipient}
          onChange={(value) => setFormData(prev => ({ ...prev, recipient: value }))}
          name="recipient"
          placeholder="Enter recipient address"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Amount</span>
        </label>
        <EtherInput
          value={formData.amount}
          onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
          name="amount"
          placeholder="Enter ETH amount"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Send Transaction
      </button>
    </form>
  );
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Component Not Found**
   ```bash
   # Make sure components are properly exported
   ls packages/nextjs/components/scaffold-eth/
   ```

2. **Styling Issues**
   ```bash
   # Verify Tailwind and DaisyUI are configured
   cat packages/nextjs/tailwind.config.js
   ```

3. **TypeScript Errors**
   ```typescript
   // Ensure proper imports
   import { Address } from '~~/components/scaffold-eth';
   // Not: import Address from 'scaffold-eth';
   ```

### Debug Information

```tsx
function DebugComponents() {
  return (
    <div className="p-4 space-y-4">
      <details>
        <summary>Component Debug Info</summary>
        <div className="mockup-code">
          <pre data-prefix="1">
            <code>Address Component: {Address ? '✅' : '❌'}</code>
          </pre>
          <pre data-prefix="2">
            <code>Balance Component: {Balance ? '✅' : '❌'}</code>
          </pre>
          <pre data-prefix="3">
            <code>Theme: {document.documentElement.getAttribute('data-theme')}</code>
          </pre>
        </div>
      </details>
    </div>
  );
}
```

## 📚 Further Reading

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [React Component Patterns](https://react.dev/learn/your-first-component)
- [Form Handling in React](https://react.dev/reference/react-dom/components)
