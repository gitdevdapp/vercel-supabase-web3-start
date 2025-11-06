# Priority 2 Roadmap - Profile V2

**Status:** Planned for November 2025  
**Effort:** 2-3 weeks development  
**Priority:** High - Core feature completion  
**Dependencies:** Priority 1 complete ✅

---

## 📋 Overview

Priority 2 focuses on enhancing the transaction history and wallet experience with metadata display, gas tracking, and improved contract information. These features will provide users with richer transaction details and better understanding of their Web3 activities.

### Key Objectives
1. **Complete Transaction Metadata** - Display contract addresses, gas costs, and collection details
2. **Enhanced User Experience** - Richer transaction cards with actionable information
3. **Performance Optimization** - Better query performance and caching
4. **Error Resolution** - Fix known database and API issues

---

## 🎯 Priority 2 Features

### 1. Contract Address Display ✅ PLANNED
**Status:** Ready for implementation  
**Effort:** 2-3 days  
**Impact:** High - Users can see deployed contract addresses  

#### Requirements
- Display contract addresses in transaction history
- Link to BaseScan contract pages
- Show "View Contract" buttons
- Handle null values gracefully

#### Implementation Plan
```typescript
// Add to TransactionHistory component
{tx.operation_type === 'deploy' && tx.contract_address && (
  <div className="contract-info">
    <span>Contract: </span>
    <a href={getContractExplorerUrl(tx.contract_address)} target="_blank">
      {formatAddress(tx.contract_address)}
    </a>
  </div>
)}
```

#### Database Changes
- Ensure `contract_address` field is populated in `wallet_transactions`
- Add foreign key relationship to `smart_contracts` table
- Update existing transactions with contract addresses

#### Testing
- Deploy contracts and verify addresses appear
- Test BaseScan links work correctly
- Verify UI handles missing addresses gracefully

---

### 2. Gas Cost Tracking ✅ PLANNED
**Status:** Ready for implementation  
**Effort:** 3-4 days  
**Impact:** High - Users understand transaction costs  

#### Requirements
- Track gas costs for all transactions
- Display gas fees in transaction history
- Calculate total costs including gas
- Show gas price and limit information

#### Database Schema Changes
```sql
-- Add to wallet_transactions table
ALTER TABLE wallet_transactions 
ADD COLUMN gas_cost DECIMAL(20, 8);

ALTER TABLE wallet_transactions 
ADD COLUMN gas_price DECIMAL(20, 8);

ALTER TABLE wallet_transactions 
ADD COLUMN gas_limit BIGINT;
```

#### API Changes
- Fetch gas costs from blockchain after transactions
- Update transaction records with gas information
- Calculate effective gas costs

#### UI Enhancements
```typescript
// Display gas information
{tx.gas_cost && (
  <div className="gas-info">
    <span>Gas Cost: {formatAmount(tx.gas_cost, 'eth')}</span>
    <span>Gas Price: {formatAmount(tx.gas_price, 'gwei')} gwei</span>
  </div>
)}
```

#### Testing
- Verify gas costs appear for new transactions
- Test gas cost calculations
- Ensure backward compatibility with old transactions

---

### 3. Collection Metadata Display ✅ PLANNED
**Status:** Ready for implementation  
**Effort:** 2-3 days  
**Impact:** Medium - Richer contract information  

#### Requirements
- Display NFT collection details in transaction history
- Show collection name, symbol, max supply
- Display mint price information
- Link to collection pages

#### Database Integration
- Join `wallet_transactions` with `smart_contracts` table
- Include collection metadata in transaction queries
- Cache frequently accessed collection data

#### UI Components
```typescript
// Enhanced deploy transaction display
{tx.operation_type === 'deploy' && tx.collection_metadata && (
  <div className="collection-details">
    <div>Name: {tx.collection_metadata.name}</div>
    <div>Symbol: {tx.collection_metadata.symbol}</div>
    <div>Max Supply: {tx.collection_metadata.max_supply}</div>
    <div>Mint Price: {formatAmount(tx.collection_metadata.mint_price, 'eth')}</div>
  </div>
)}
```

#### Testing
- Deploy collections and verify metadata appears
- Test with different collection configurations
- Verify UI handles missing metadata

---

### 4. Operation Type Standardization ✅ PLANNED
**Status:** Ready for implementation  
**Effort:** 1-2 days  
**Impact:** Medium - Consistent operation handling  

#### Requirements
- Standardize all operation types across the system
- Ensure consistent badge colors and icons
- Add missing operation types (send, receive)
- Update all UI components to handle all types

#### Operation Types to Support
```typescript
type OperationType = 
  | 'fund'          // Faucet funding (blue)
  | 'super_faucet'  // Super faucet (blue) 
  | 'deploy'        // Contract deployment (purple)
  | 'send'          // Token transfers out (orange)
  | 'receive'       // Token transfers in (green)
  | 'mint'          // NFT minting (green)
  | 'burn'          // Token burning (red)
  | 'stake'         // Token staking (blue)
  | 'unstake'       // Token unstaking (orange)
```

#### Implementation
- Update `getOperationIcon()` and `getOperationBadgeClass()` functions
- Add new operation type handlers
- Ensure all APIs use consistent operation types
- Update database constraints if needed

#### Testing
- Test all operation types display correctly
- Verify badge colors and icons are consistent
- Test with various transaction scenarios

---

### 5. Database Function Fixes ✅ PLANNED
**Status:** Ready for implementation  
**Effort:** 1-2 days  
**Impact:** High - Fixes broken contract logging  

#### Issues to Resolve
1. **log_contract_deployment parameter mismatch**
2. **Missing collection metadata storage**
3. **Inconsistent RPC function signatures**

#### Fix Implementation
```sql
-- Update log_contract_deployment function
CREATE OR REPLACE FUNCTION log_contract_deployment(
  p_user_id UUID,
  p_wallet_id UUID,
  p_contract_address TEXT,
  p_contract_name TEXT,
  p_contract_symbol TEXT,      -- Add missing parameter
  p_max_supply INTEGER,        -- Add missing parameter  
  p_mint_price_wei TEXT,       -- Add missing parameter
  p_tx_hash TEXT,
  p_network TEXT,
  p_abi JSONB,
  p_deployment_block INTEGER
) RETURNS UUID AS $$
-- Implementation to store all metadata
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### API Updates
- Update contract deployment API to pass all parameters
- Add collection metadata validation
- Improve error handling for database operations

#### Testing
- Deploy contracts and verify all metadata is stored
- Check database records contain complete information
- Verify no more function parameter errors

---

## 📊 Implementation Timeline

### Week 1 (November 4-8, 2025)
**Focus:** Core transaction enhancements  
**Tasks:**
- ✅ Contract address display implementation
- ✅ Gas cost tracking database schema
- ✅ Basic gas cost API integration

**Deliverables:**
- Contract addresses visible in transaction history
- Gas cost fields added to database
- Basic gas cost calculation logic

### Week 2 (November 11-15, 2025)
**Focus:** Enhanced metadata and UI  
**Tasks:**
- ✅ Collection metadata display
- ✅ Operation type standardization
- ✅ Gas cost UI integration

**Deliverables:**
- Rich collection information in transactions
- All operation types properly handled
- Gas costs displayed in transaction details

### Week 3 (November 18-22, 2025)
**Focus:** Database fixes and testing  
**Tasks:**
- ✅ Database function parameter fixes
- ✅ Complete metadata storage
- ✅ Comprehensive testing and validation

**Deliverables:**
- Fixed contract deployment logging
- Complete collection metadata storage
- Fully tested Priority 2 features

---

## 🔧 Technical Implementation Details

### Database Schema Changes
```sql
-- Add gas tracking columns
ALTER TABLE wallet_transactions 
ADD COLUMN gas_cost DECIMAL(20, 8),
ADD COLUMN gas_price DECIMAL(20, 8),
ADD COLUMN gas_limit BIGINT;

-- Add collection metadata columns (if needed)
ALTER TABLE wallet_transactions 
ADD COLUMN collection_name TEXT,
ADD COLUMN collection_symbol TEXT,
ADD COLUMN max_supply INTEGER,
ADD COLUMN mint_price_wei TEXT;

-- Update indexes for performance
CREATE INDEX idx_wallet_transactions_contract_address 
ON wallet_transactions(contract_address) WHERE contract_address IS NOT NULL;
```

### API Enhancements
```typescript
// Enhanced transaction response
interface Transaction {
  id: string;
  operation_type: OperationType;
  token_type: 'eth' | 'usdc';
  amount: number | null;
  contract_address?: string;
  gas_cost?: number;
  gas_price?: number;
  collection_metadata?: {
    name: string;
    symbol: string;
    max_supply: number;
    mint_price: string;
  };
  // ... existing fields
}
```

### UI Component Updates
```typescript
// Enhanced TransactionHistory component
const TransactionItem = ({ tx }: { tx: Transaction }) => {
  return (
    <div className="transaction-item">
      {/* Status and operation badges */}
      <OperationBadge type={tx.operation_type} />
      
      {/* Amount and gas cost */}
      <AmountDisplay amount={tx.amount} gasCost={tx.gas_cost} />
      
      {/* Contract information */}
      {tx.contract_address && (
        <ContractInfo address={tx.contract_address} />
      )}
      
      {/* Collection metadata */}
      {tx.collection_metadata && (
        <CollectionInfo metadata={tx.collection_metadata} />
      )}
      
      {/* Transaction details */}
      <TransactionDetails tx={tx} />
    </div>
  );
};
```

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Contract addresses displayed for all deployments
- [ ] Gas costs shown for applicable transactions
- [ ] Collection metadata visible in transaction details
- [ ] All operation types handled consistently
- [ ] Database function errors resolved

### Performance Requirements
- [ ] Transaction history loads in <500ms
- [ ] Database queries optimized with proper indexing
- [ ] UI renders smoothly with enhanced metadata
- [ ] No performance regression from Priority 1

### Quality Requirements
- [ ] All new features tested end-to-end
- [ ] Error handling for missing metadata
- [ ] Backward compatibility maintained
- [ ] TypeScript types updated and validated

### User Experience Requirements
- [ ] Rich transaction information easily accessible
- [ ] Clear visual hierarchy for different data types
- [ ] Intuitive navigation to contract pages
- [ ] Helpful tooltips and contextual information

---

## 🚨 Dependencies & Risks

### Dependencies
- **Priority 1 Complete:** ✅ All Priority 1 fixes implemented
- **Database Access:** ✅ Supabase connection working
- **Blockchain Access:** ✅ Base Sepolia network available
- **API Endpoints:** ✅ All Priority 1 APIs functional

### Risks & Mitigations

#### Database Migration Risks
**Risk:** Schema changes could break existing functionality  
**Mitigation:** 
- Test migrations on development database first
- Implement gradual rollout with feature flags
- Maintain backward compatibility

#### Performance Impact
**Risk:** Additional metadata could slow transaction loading  
**Mitigation:**
- Implement database indexing for new fields
- Add pagination for large transaction lists
- Optimize queries with selective field loading

#### API Rate Limits
**Risk:** Additional blockchain queries could hit rate limits  
**Mitigation:**
- Implement caching for frequently accessed data
- Batch API calls where possible
- Add retry logic with exponential backoff

#### UI Complexity
**Risk:** Enhanced transaction cards could become cluttered  
**Mitigation:**
- Implement progressive disclosure (expand/collapse)
- Use clear visual hierarchy
- Add user preferences for information density

---

## 📋 Testing Strategy

### Unit Testing
- Component rendering with new metadata
- API response parsing and validation
- Database function parameter handling
- Error state management

### Integration Testing
- End-to-end contract deployment flow
- Transaction history with all metadata
- Database queries with new fields
- API rate limiting and error handling

### Manual Testing Checklist
- [ ] Deploy contract → Verify address appears in history
- [ ] Check gas costs display correctly
- [ ] Verify collection metadata shows
- [ ] Test all operation type badges
- [ ] Confirm BaseScan links work
- [ ] Test error handling for missing data

### Performance Testing
- Transaction history load times
- Database query performance
- UI rendering with large metadata sets
- Memory usage and bundle size impact

---

## 🔄 Rollback Plan

### Database Rollback
```sql
-- Remove added columns if needed
ALTER TABLE wallet_transactions 
DROP COLUMN IF EXISTS gas_cost,
DROP COLUMN IF EXISTS gas_price,
DROP COLUMN IF EXISTS gas_limit,
DROP COLUMN IF EXISTS collection_name,
DROP COLUMN IF EXISTS collection_symbol,
DROP COLUMN IF EXISTS max_supply,
DROP COLUMN IF EXISTS mint_price_wei;
```

### Code Rollback
- Revert to Priority 1 TransactionHistory component
- Remove enhanced API endpoints
- Restore original database function calls

### Feature Flag Rollback
- Disable enhanced transaction display
- Show basic transaction information only
- Maintain core Priority 1 functionality

---

## 📈 Expected Impact

### User Experience Improvements
- **Transaction Transparency:** Users can see complete transaction details
- **Cost Awareness:** Gas fees and total costs clearly displayed
- **Contract Discovery:** Easy access to deployed contracts
- **Collection Management:** Rich information about NFT collections

### Technical Improvements
- **Data Completeness:** Comprehensive transaction metadata
- **Query Performance:** Optimized database access patterns
- **API Efficiency:** Reduced redundant blockchain calls
- **Error Resilience:** Better handling of missing data

### Business Value
- **User Retention:** Richer experience encourages continued usage
- **Feature Adoption:** Enhanced visibility drives contract deployment
- **Support Reduction:** Self-service access to transaction details
- **Analytics Readiness:** Complete data for user behavior analysis

---

## 🔗 Related Documentation

### Current State
- **[README.md](README.md)** - Profile V2 overview
- **[PROFILE-OVERVIEW.md](PROFILE-OVERVIEW.md)** - System architecture
- **[TRANSACTION-HISTORY-STATE.md](TRANSACTION-HISTORY-STATE.md)** - Current transaction system

### Technical Details
- **[DATABASE-INTEGRATION.md](DATABASE-INTEGRATION.md)** - Database schema
- **[API-ENDPOINTS.md](API-ENDPOINTS.md)** - API documentation
- **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** - Current limitations

### Future Planning
- **[PRIORITY-3-ROADMAP.md](PRIORITY-3-ROADMAP.md)** - Advanced features
- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)** - Production deployment

---

## 📞 Development Team

### Recommended Team Composition
- **Frontend Developer:** UI component enhancements (2-3 days)
- **Backend Developer:** API and database changes (3-4 days)
- **Full-stack Developer:** Integration and testing (2-3 days)
- **QA Engineer:** Testing and validation (2-3 days)

### Key Skills Required
- React/Next.js development experience
- PostgreSQL and Supabase expertise
- Ethereum/blockchain knowledge
- UI/UX design sensibility
- Testing and debugging skills

### Timeline Considerations
- **Parallel Development:** Frontend and backend work can proceed in parallel
- **Database First:** Schema changes should be implemented before API changes
- **Testing Throughout:** Continuous testing as features are implemented
- **Documentation Updates:** Keep docs current with implementation progress

---

## ✅ Acceptance Criteria

### Functional Acceptance
- [ ] Contract addresses display correctly in transaction history
- [ ] Gas costs are calculated and shown for applicable transactions
- [ ] Collection metadata appears for NFT deployments
- [ ] All operation types have consistent styling and behavior
- [ ] Database function errors are resolved

### Technical Acceptance
- [ ] Code builds without errors or warnings
- [ ] All TypeScript types are correct and complete
- [ ] Database migrations are safe and reversible
- [ ] API responses include new metadata fields
- [ ] Performance benchmarks are met or exceeded

### Quality Acceptance
- [ ] Comprehensive test coverage for new features
- [ ] Error handling for edge cases and missing data
- [ ] Accessibility considerations addressed
- [ ] Mobile responsiveness maintained
- [ ] Cross-browser compatibility verified

### User Experience Acceptance
- [ ] Information hierarchy is clear and intuitive
- [ ] Loading states and error messages are helpful
- [ ] Performance feels smooth and responsive
- [ ] New features add value without confusion
- [ ] Progressive enhancement maintains basic functionality

---

## 📝 Implementation Notes

Priority 2 builds directly on Priority 1's solid foundation. The focus is on enriching the transaction experience with actionable metadata while maintaining the performance and reliability established in the first phase.

**Key Success Factors:**
- Comprehensive metadata without performance degradation
- Intuitive UI that doesn't overwhelm users
- Robust error handling for incomplete data
- Backward compatibility with existing transactions

**Risk Mitigation:**
- Gradual rollout with feature flags
- Extensive testing before production deployment
- Monitoring and alerting for new metrics
- Clear rollback procedures if issues arise

**Last Updated:** October 28, 2025
