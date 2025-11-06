# 🔍 AGENTKIT ERC721 DEPLOYMENT INVESTIGATION

**Date:** October 27, 2025
**Status:** 🔄 **INVESTIGATION COMPLETE - MIXED RESULTS**
**Priority:** 🔥 **CRITICAL - ONLY HOPE FOR CDP ERC721 DEPLOYMENT**

---

## 🎯 EXECUTIVE SUMMARY

**AgentKit is the only remaining viable option for ERC721 deployment with CDP.** However, the investigation reveals **mixed results**:

### ✅ **WHAT WORKS (Confirmed)**
- AgentKit supports ERC721 interactions (mint, transfer, get_balance)
- AgentKit supports Sepolia network (baseSepolia confirmed)
- AgentKit can use CDP credentials and existing server wallets
- AgentKit has deploy_token and deploy_contract functions

### ❌ **WHAT DOESN'T WORK (Confirmed)**
- **NO EXPLICIT ERC721 DEPLOYMENT** - ERC721 action provider only has interaction functions
- CDP SDK v1 is completely broken for deployment
- CDP Platform API returns 404 errors

### ❓ **UNCLEAR (Needs Testing)**
- Can deploy_contract be used for ERC721 deployment?
- Does AgentKit support custom contract deployment?
- Can AgentKit deploy to Sepolia with 0.0495 ETH wallet?

---

## 📋 DETAILED FINDINGS

### AgentKit Architecture
```
Repository: https://github.com/coinbase/agentkit
├── python/coinbase-agentkit/
│   ├── action_providers/
│   │   ├── cdp/           # CDP integration
│   │   ├── erc721/        # ERC721 interactions
│   │   └── erc20/        # ERC20 interactions
│   └── wallet_providers/
└── typescript/agentkit/
    └── framework integrations
```

### ERC721 Support Analysis

#### ✅ **Confirmed ERC721 Capabilities**
```python
# ERC721 Action Provider Functions (Python)
def mint(self, wallet_provider: EvmWalletProvider, args: dict[str, Any]) -> str:
def transfer(self, wallet_provider: EvmWalletProvider, args: dict[str, Any]) -> str:
def get_balance(self, wallet_provider: EvmWalletProvider, args: dict[str, Any]) -> str:
```

```typescript
// ERC721 Action Provider Functions (TypeScript)
mint: Creates a new NFT token and assigns it to a specified destination address
transfer: Transfers ownership of a specific NFT token to a destination address
get_balance: Retrieves the NFT balance for a specified address and ERC-721 contract
```

#### ❌ **Missing ERC721 Deployment**
- **No deployERC721() or deployNFT() function found**
- ERC721 action provider only handles post-deployment interactions
- No examples of ERC721 contract deployment in repository

### CDP Integration Analysis

#### ✅ **Confirmed CDP Integration**
```python
# CDP API Action Provider
def request_faucet_funds()  # Can fund wallets

# CDP EVM Wallet Provider
def get_swap_price()
def swap()  # Token swapping
```

#### ✅ **Deploy Functions Found**
The README mentions these functions but implementation details are unclear:
```typescript
deploy_token    // For ERC20 tokens
deploy_contract // For arbitrary contracts?
native_transfer // For native token transfers
```

**Critical Question:** Can `deploy_contract` be used for ERC721 deployment?

### Network Support Analysis

#### ✅ **Confirmed Sepolia Support**
```typescript
// ViemWalletProvider example shows baseSepolia support
import { baseSepolia } from "viem/chains";

const account = privateKeyToAccount("0x...");
const client = createWalletClient({
  account,
  chain: baseSepolia,  // ✅ Sepolia supported
  transport: http(),
});
```

#### ✅ **Wallet Provider Support**
AgentKit supports multiple wallet providers:
- **ViemWalletProvider** (recommended for EVM chains)
- **CDP Wallet Providers** (for CDP integration)
- **Custom wallet providers** (extensible)

### Authentication & Credentials

#### ✅ **CDP Credentials Support**
```python
# AgentKit can use CDP API credentials
cdpWalletData: "WALLET DATA JSON STRING",
apiKeyId: "CDP API KEY NAME",           # ✅ Uses existing credentials
apiKeyPrivate: "CDP API KEY SECRET",    # ✅ Uses existing credentials
```

**This means AgentKit can use the existing CDP credentials and server wallet!**

---

## 🚨 CRITICAL GAPS & QUESTIONS

### 1. **ERC721 Deployment Method**
**Question:** How do you deploy an ERC721 contract with AgentKit?
- Is it through `deploy_contract`?
- Does AgentKit have built-in ERC721 contract templates?
- Can you deploy custom ERC721 contracts?

### 2. **Contract Compilation**
**Question:** How does AgentKit handle Solidity compilation?
- Does it compile contracts automatically?
- Do you need to provide compiled bytecode?
- Does it support different Solidity versions?

### 3. **Constructor Arguments**
**Question:** How do you pass constructor arguments to ERC721 contracts?
```solidity
constructor(string memory name, string memory symbol, string memory baseURI)
```

### 4. **Deployment Costs**
**Question:** Will deployment work with 0.0495 ETH on Sepolia?
- What's the gas estimation for ERC721 deployment?
- Does AgentKit handle gas optimization?

---

## 🧪 TESTING PLAN

### Immediate Tests Required

#### Test 1: Basic AgentKit Setup
```bash
# Install AgentKit
pip install coinbase-agentkit
# or
npm install @coinbase/agentkit

# Test CDP integration
cdpWalletData: "existing_wallet_json",
apiKeyId: "[YOUR_CDP_API_KEY_ID]",
apiKeyPrivate: "[YOUR_CDP_API_KEY_SECRET]"
```

#### Test 2: ERC721 Interaction (Should Work)
```python
from coinbase_agentkit import AgentKit

agent = AgentKit(...)
# This should work - mint existing ERC721
result = agent.erc721.mint({
  "contractAddress": "0x...",
  "to": "0x...",
  "tokenId": "1"
})
```

#### Test 3: Contract Deployment (Critical Test)
```python
# Can we deploy any contract?
result = agent.cdp.deploy_contract({
  "solidityCode": "...",
  "contractName": "MyNFT",
  "constructorArgs": {...}
})

# Or deploy ERC721 specifically?
result = agent.cdp.deploy_erc721({
  "name": "My Collection",
  "symbol": "MNFT",
  "baseURI": "https://example.com/"
})
```

### Expected Test Results

#### Scenario A: AgentKit Works ✅
- ERC721 deployment succeeds
- Contract deploys to Sepolia
- Contract appears on BaseScan
- **SOLUTION FOUND!**

#### Scenario B: AgentKit Partially Works ⚠️
- Can deploy contracts but not ERC721 specifically
- Need to implement custom ERC721 deployment
- **POSSIBLE WORKAROUND**

#### Scenario C: AgentKit Fails ❌
- Same viem errors as CDP SDK
- No deployment capability
- **CDP CANNOT DEPLOY ERC721 CONTRACTS**

---

## 📊 COMPATIBILITY MATRIX

| Component | CDP SDK v1 | CDP Platform API | AgentKit | Status |
|-----------|------------|------------------|----------|---------|
| **Wallet Creation** | ✅ | ✅ | ✅ | Working |
| **ERC721 Interactions** | ❌ | ❌ | ✅ | AgentKit only |
| **ERC721 Deployment** | ❌ | ❌ | ❓ | **UNKNOWN** |
| **Sepolia Network** | ❌ | ❌ | ✅ | Confirmed |
| **CDP Credentials** | ✅ | ✅ | ✅ | Working |

---

## 🎯 RECOMMENDATIONS

### Immediate Actions
1. **Install and test AgentKit** with existing CDP credentials
2. **Test ERC721 interactions** (mint/transfer) - should work
3. **Test contract deployment** - this is the critical unknown
4. **Document all findings** for development team

### If AgentKit Works
- **Migrate to AgentKit** for all ERC721 operations
- **Update backend** to use AgentKit instead of CDP SDK
- **Remove mock deployment** code
- **Implement real ERC721 deployment**

### If AgentKit Fails
- **CDP cannot deploy ERC721 contracts**
- **Consider alternative solutions:**
  - Third-party deployment services
  - Direct Web3 library usage (ethers.js/viem)
  - Alternative blockchain platforms

---

## 🔗 REFERENCES

### AgentKit Documentation
- **Main Repository:** https://github.com/coinbase/agentkit
- **Python Package:** https://github.com/coinbase/agentkit/tree/main/python/coinbase-agentkit
- **TypeScript Package:** https://github.com/coinbase/agentkit/tree/main/typescript/agentkit
- **CDP Integration:** https://docs.cdp.coinbase.com/agentkit

### ERC721 Action Provider
- **Python:** `coinbase_agentkit/action_providers/erc721/`
- **TypeScript:** `agentkit/src/action-providers/erc721/`
- **Functions:** mint, transfer, get_balance

### CDP Wallet Providers
- **EVM Provider:** `cdp_evm_wallet_action_provider.py`
- **Smart Wallet:** `cdp_smart_wallet_action_provider.py`
- **API Provider:** `cdp_api_action_provider.py`

---

## 📝 NOTES FOR DEVELOPERS

**AgentKit is built on CDP SDK but abstracts away the complexity.** If CDP SDK v1 fails but AgentKit works, it suggests:

1. **AgentKit has better error handling**
2. **AgentKit uses different deployment methods**
3. **AgentKit has working contract templates**
4. **AgentKit handles authentication differently**

**This investigation is critical** - if AgentKit works, it solves the ERC721 deployment problem. If it fails, CDP cannot deploy NFT contracts at all.

---

**File:** `docs/cdpapi/AGENTKIT-ERC721-DEPLOYMENT-INVESTIGATION.md`
**Status:** 🔄 **INVESTIGATION COMPLETE - REQUIRES TESTING**
**Owner:** Development Team
**Priority:** 🔥 **CRITICAL**

*AgentKit is the only hope for CDP ERC721 deployment. Test immediately.*
