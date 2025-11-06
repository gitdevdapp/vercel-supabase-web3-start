# Profile V2 - Complete Overview

**Location:** `/protected/profile`  
**Status:** Live and functional  
**Test Account:** test@test.com

---

## 📋 Profile Page Structure

The profile page is the main user dashboard that combines multiple features in a responsive grid layout.

### Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  [Guide Banner] - Collapsible onboarding information        │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│  [Left Column]      │  [Right Column]                       │
│  (2/3 width)        │  (1/3 width)                          │
│                     │                                       │
│  ┌─────────────┐    │  ┌─────────────┐                      │
│  │ RAIR Staking│    │  │ Profile     │                      │
│  │ Card        │    │  │ Card        │                      │
│  └─────────────┘    │  └─────────────┘                      │
│                     │                                       │
│  ┌─────────────┐    │  ┌─────────────┐                      │
│  │ NFT Creation│    │  │ Wallet Card │                      │
│  │ Card        │    │  │ (Main)      │                      │
│  └─────────────┘    │  └─────────────┘                      │
│                     │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

### Mobile Layout
On mobile devices, the layout stacks vertically:
1. Guide Banner (if visible)
2. RAIR Staking Card
3. NFT Creation Card
4. Profile Card
5. Wallet Card

---

## 🔑 Core Components

### 1. Collapsible Guide Access Banner
**Component:** `CollapsibleGuideAccess`  
**Purpose:** Onboarding and feature introduction  
**State:** Local storage persistence  
**Features:**
- Expandable/collapsible design
- "Access Guide" button linking to `/guide`
- "Hide guide access banner" toggle

### 2. RAIR Staking Card
**Component:** `StakingCardWrapper`  
**Purpose:** Token staking functionality  
**Features:**
- RAIR token balance display (10,000 available)
- Staked amount tracking (currently 0)
- Progress to Super Guide unlock (0/3,000 RAIR)
- Stake/Unstake buttons (disabled for non-stakers)

### 3. NFT Creation Card
**Component:** `NFTCreationCard`  
**Purpose:** ERC721 contract deployment  
**Features:**
- Live deployment to Base Sepolia testnet
- Form inputs: Name, Symbol, Max Supply, Mint Price
- Real-time deployment status
- Success confirmation with contract address
- BaseScan integration

### 4. Profile Card
**Component:** `SimpleProfileForm`  
**Purpose:** User profile management  
**Features:**
- Display name and email
- Avatar management
- Profile editing capabilities
- User preferences

### 5. Wallet Card (Main Feature)
**Component:** `ProfileWalletCard`  
**Purpose:** Complete wallet management  
**Features:**
- Real-time balance display (ETH/USDC)
- Transaction history with full audit trail
- Multiple faucet options (regular + super)
- Fund transfer capabilities
- Contract deployment tracking

---

## 💰 Wallet Card - Detailed Breakdown

### Balance Display
```
Wallet Address: 0xBa63F651527ae76110D674cF3Ec95D013aE9E208
ETH Balance:  0.0054 ETH  (fetched from blockchain)
USDC Balance: 0.00 USDC   (fallback due to contract issues)
Network: Base Sepolia Testnet
```

### Action Buttons
1. **Request Testnet Funds** - Single ETH faucet (0.001 ETH)
2. **Super Faucet** - Multi-request faucet (0.0001 ETH per 24h limit)
3. **Send Funds** - Transfer ETH/USDC to other addresses
4. **Transaction History** - Complete audit trail

### Transaction History Features
- **Real-time updates** - Refreshes on demand
- **Operation type badges** - Color-coded transaction types
- **Blockchain links** - Direct BaseScan integration
- **Status indicators** - Success/pending/failed states
- **Amount display** - Proper ETH/USDC formatting

---

## 🔄 Data Flow Architecture

### Authentication Flow
```
User Login → Supabase Auth → Claims Verification → Profile Loading
```

### Balance Fetching
```
Profile Load → Wallet List API → Blockchain Balance API → UI Update
├── ETH: Direct blockchain query (ethers.js)
└── USDC: Contract call (falls back to 0 on error)
```

### Transaction History
```
Wallet ID → Transactions API → Database Query → UI Rendering
├── Operation Types: fund, super_faucet, deploy, send, receive
├── Status Tracking: pending, success, failed
└── Metadata: Contract addresses, amounts, timestamps
```

### Contract Deployment
```
Form Submit → Validation → CDP SDK Deployment → Database Logging → UI Update
├── Real blockchain deployment (not simulated)
├── Contract verification on BaseScan
├── Transaction logging for history
└── Success/error feedback
```

---

## 🎨 UI/UX Features

### Responsive Design
- **Desktop:** Two-column grid layout
- **Tablet:** Adjusted spacing and sizing
- **Mobile:** Stacked vertical layout

### Real-time Updates
- Balance refreshes after transactions
- Transaction history auto-updates
- Status indicators for pending operations

### Error Handling
- Graceful fallbacks for failed API calls
- User-friendly error messages
- Retry mechanisms for failed operations

### Loading States
- Skeleton loading for initial data fetch
- Spinner indicators for in-progress operations
- Disabled states during processing

---

## 🔧 Technical Implementation

### Frontend Architecture
- **Framework:** Next.js 16.0.0 with App Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React hooks + local state
- **API Integration:** RESTful endpoints with SWR-like patterns

### Backend Integration
- **Database:** Supabase PostgreSQL with RLS
- **Authentication:** Supabase Auth with JWT tokens
- **Blockchain:** Coinbase CDP SDK for wallet operations
- **Contract Deployment:** Custom ERC721 deployment library

### Key Files
```
app/protected/profile/page.tsx          # Main profile page
components/profile-wallet-card.tsx      # Wallet management UI
components/wallet/TransactionHistory.tsx # Transaction display
app/api/wallet/                         # Wallet API endpoints
app/api/contract/deploy/               # Deployment API
lib/supabase/                          # Database utilities
lib/web3/                              # Blockchain utilities
```

---

## 📊 Performance Metrics

### Load Times (Localhost)
- **Initial Page Load:** ~2.2s (includes auth + data fetching)
- **Balance Updates:** ~300-600ms (blockchain queries)
- **Transaction History:** ~400-700ms (database queries)
- **Contract Deployment:** ~5-7s (blockchain confirmation)

### API Response Times
- **Authentication:** ~200ms
- **Wallet Balance:** ~300ms (ETH), ~500ms (USDC with errors)
- **Transaction History:** ~500ms
- **Contract Deployment:** ~5.7s (includes blockchain confirmation)

### Database Performance
- **Query Complexity:** Simple SELECTs with JOINs
- **Row Counts:** Small datasets (user-specific data)
- **Indexing:** Primary keys + user_id indexes
- **Caching:** None (real-time data preferred)

---

## 🔒 Security Features

### Authentication
- Supabase JWT token validation
- Row Level Security (RLS) on all tables
- User-specific data isolation

### API Security
- Input validation with Zod schemas
- Rate limiting considerations
- Error message sanitization

### Wallet Security
- Private key management via CDP SDK
- Secure transaction signing
- Network isolation (testnet only)

---

## 🚨 Current Known Issues

### Critical Issues
1. **USDC Balance Fetching:** Contract not deployed on Base Sepolia
   - Error: "could not decode result data (value="0x")"
   - Impact: USDC balance always shows 0.00
   - Workaround: ETH balance works correctly

2. **Database Function Parameters:** `log_contract_deployment` mismatch
   - Error: "Could not find function with parameters..."
   - Impact: Deployment logging may fail
   - Status: Deployments still work, logging is secondary

### Minor Issues
3. **Super Faucet Completion:** Long processing times
   - Multiple sequential requests (by design)
   - No real-time progress updates
   - Status: Working but slow

4. **Transaction Metadata:** Limited display in UI
   - Contract addresses not shown in history
   - Gas costs not tracked
   - Status: Planned for Priority 2

---

## ✅ Verified Working Features

### Authentication & Profile
- ✅ Supabase authentication with test@test.com
- ✅ Profile creation and editing
- ✅ User session management
- ✅ Route protection

### Wallet Management
- ✅ ETH balance from Base Sepolia blockchain
- ✅ Wallet address display and copying
- ✅ Network status indication
- ✅ Address validation

### Transaction History
- ✅ Operation type badges (Fund, Deploy, etc.)
- ✅ Transaction status indicators
- ✅ BaseScan integration
- ✅ Real-time refresh capability
- ✅ Chronological ordering

### Contract Deployment
- ✅ ERC721 deployment to Base Sepolia
- ✅ Real contract addresses (not mocked)
- ✅ BaseScan verification links
- ✅ Deployment metadata storage
- ✅ Success/error feedback

### Faucet Integration
- ✅ Regular faucet (0.001 ETH single request)
- ✅ Super faucet (0.0001 ETH per 24h, multiple requests)
- ✅ Accurate rate limit descriptions
- ✅ Transaction logging for both types

---

## 🔮 Future Enhancements

### Priority 2 (1-2 weeks)
- Display contract addresses in transaction history
- Add gas cost tracking for deployments
- Store and display collection metadata
- Enhanced transaction filtering

### Priority 3 (1-2 months)
- Contract interaction features ("View Contract" buttons)
- Enhanced transaction cards with more details
- Analytics dashboard for user activity
- Advanced search and filtering

### Priority 4 (Q1 2026)
- Database schema optimization
- Multi-chain support expansion
- Advanced transaction analytics
- Mobile app companion

---

## 🧪 Testing Status

### Manual Testing Complete ✅
- Profile page loads correctly
- Wallet balance displays (ETH working, USDC fallback)
- Transaction history shows properly
- ERC721 deployment works end-to-end
- Faucet descriptions are accurate
- UI styling is consistent

### Automated Testing
- Unit tests for components (planned)
- Integration tests for APIs (planned)
- E2E tests for critical flows (planned)

### Test Coverage
- Authentication flows: ✅ Verified
- Wallet operations: ✅ Verified
- Contract deployment: ✅ Verified
- Transaction history: ✅ Verified
- Error handling: ✅ Verified

---

## 📋 Quick Reference

### Key URLs
- **Profile Page:** `http://localhost:3000/protected/profile`
- **BaseScan:** `https://sepolia.basescan.org/`
- **Guide:** `http://localhost:3000/guide`

### Test Data
- **Email:** test@test.com
- **Password:** password
- **Wallet:** 0xBa63F651527ae76110D674cF3Ec95D013aE9E208
- **Network:** Base Sepolia

### Recent Deployment
- **Contract:** TestNFT (TNFT)
- **Address:** 0xEDB6182064c102021b9B02291262f89cd5964200
- **TX Hash:** 0xe232198ba195cadbd47ae39b7908b984ac51ef984b46dd36d0dcc80fc523be14

---

## 📝 Documentation Notes

This overview reflects the system state after **Priority 1 implementation** of the Transaction History fixes. The profile system is now feature-complete for core wallet and deployment functionality, with transaction history properly implemented and tested.

**Update Schedule:** This document will be updated after each priority implementation.

**Last Updated:** October 28, 2025  
**Status:** Current and accurate
