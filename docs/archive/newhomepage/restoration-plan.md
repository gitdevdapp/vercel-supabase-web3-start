# Homepage Restoration Plan

## Current State Analysis

### Homepage Structure (`app/page.tsx`)
- Currently displays DevDapp-branded content
- Includes Hero, TokenomicsHomepage, ProblemExplanationSection, FeaturesSection, HowItWorksSection, FoundationSection, FinalCtaSection, BackedBySection
- Uses DevDappLogo in header navigation

### Header/Navigation Issues
- **Current**: Uses `DevDappLogo` component displaying DevDapp branding
- **Previous (commit 30cfff6)**: Used `DemoLogo` component showing "Your Logo Here" with Web3 symbol
- **Missing**: `DemoLogo` component has been removed from current codebase

### SEO Metatags (`app/layout.tsx`)
- Currently branded as "DevDapp - Deploy Decentralized Applications Fast"
- Title, description, and OpenGraph data all reference DevDapp
- Should be generic/default for demo template

### Marketplace Component
- **Current**: No dedicated marketplace component exists
- **References**: Marketplace functionality mentioned in ApeChain components but no standalone component
- **Needed**: Create marketplace component for homepage integration

## Restoration Plan

### Phase 1: Logo Restoration

1. **Restore DemoLogo Component**
   - Recreate `components/ui/images/demo-logo.tsx` with Web3 symbol and "Your Logo Here" text
   - Update `components/ui/images/index.ts` to export DemoLogo
   - Replace DevDappLogo with DemoLogo in `components/navigation/global-nav.tsx`

2. **Update Navigation**
   - Change import from `DevDappLogo` to `DemoLogo` in global-nav.tsx
   - Ensure logo displays correctly in light/dark themes

### Phase 2: SEO Metatags Restoration

1. **Update Root Layout Metatags**
   - Change title to generic demo template title
   - Update description to be template-focused
   - Modify OpenGraph and Twitter metadata
   - Update keywords to be more generic

2. **Homepage-Specific Metatags**
   - Consider removing specific DevDapp branding from homepage component
   - Ensure template nature is clear

### Phase 3: Marketplace Component Creation

1. **Create Marketplace Component**
   - Build `components/marketplace/MarketplaceSection.tsx`
   - Include NFT marketplace features, listings, and demo content
   - Style consistently with existing homepage sections

2. **Homepage Integration**
   - Add MarketplaceSection to `app/page.tsx`
   - Position appropriately in the page flow
   - Ensure responsive design and theme compatibility

### Phase 4: Content Updates

1. **Update Hero Section**
   - Modify `components/hero.tsx` to be more generic/demo-focused
   - Remove specific DevDapp references

2. **Update Other Sections**
   - Review and update TokenomicsHomepage, FeaturesSection, etc.
   - Ensure content is template-appropriate

### Phase 5: Testing and Validation

1. **Visual Testing**
   - Verify logo displays correctly
   - Check responsive design
   - Test theme switching

2. **SEO Validation**
   - Confirm metatags are generic
   - Test OpenGraph previews
   - Validate Twitter cards

3. **Functionality Testing**
   - Ensure marketplace component works
   - Test navigation
   - Verify all links and interactions

## Implementation Timeline

- **Phase 1**: 30 minutes - Logo restoration
- **Phase 2**: 45 minutes - SEO updates
- **Phase 3**: 2 hours - Marketplace component development
- **Phase 4**: 1 hour - Content updates
- **Phase 5**: 30 minutes - Testing

## Files to Modify

### Phase 1 Files:
- `components/ui/images/demo-logo.tsx` (create)
- `components/ui/images/index.ts` (update)
- `components/navigation/global-nav.tsx` (update)

### Phase 2 Files:
- `app/layout.tsx` (update)
- `app/page.tsx` (update if needed)

### Phase 3 Files:
- `components/marketplace/MarketplaceSection.tsx` (create)
- `app/page.tsx` (update)

### Phase 4 Files:
- `components/hero.tsx` (update)
- Other section components as needed

## Success Criteria

1. Logo displays "Your Logo Here" with Web3 symbol
2. SEO metatags are generic/template-focused
3. Marketplace component loads on homepage
4. All functionality works correctly
5. Visual design maintains professional appearance
6. Template is ready for user customization

## Risk Assessment

- **Low Risk**: Logo and SEO changes are straightforward text/metadata updates
- **Medium Risk**: Marketplace component creation requires design consistency
- **Low Risk**: Content updates are text-only changes
- **Mitigation**: Test each phase incrementally, rollback if issues arise

## Dependencies

- Requires existing UI component library (Radix UI, Tailwind)
- Depends on Next.js 15 and React 19
- Uses existing theme system (next-themes)
- Leverages current routing structure
