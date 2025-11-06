# Root Structure Analysis & Cleanup Plan

**Date**: October 27, 2025
**Purpose**: Identify critical folders for Next.js/Supabase/Vercel and safely reorganize non-critical items

## CRITICAL FOLDERS (Required for Vercel Build & Runtime)

### ✅ `app/` - CRITICAL
- **Purpose**: Next.js App Router pages and API routes
- **Required by**: Vercel build process, Next.js framework
- **Status**: MUST STAY at root
- **Size**: Full feature set (auth, wallets, profiles, etc.)

### ✅ `components/` - CRITICAL
- **Purpose**: React components used across the app
- **Imports**: Used by `app/` routes
- **Path aliases**: `@/components/*` configured in tsconfig.json
- **Status**: MUST STAY at root
- **Size**: ~50+ files organized by feature

### ✅ `lib/` - CRITICAL
- **Purpose**: Utility functions, Supabase client, helpers, types
- **Imports**: Used by `app/`, `components/`
- **Path aliases**: `@/lib/*` configured in tsconfig.json
- **Contains**: Auth helpers, environment setup, web3 utilities, profile logic
- **Status**: MUST STAY at root

### ✅ `public/` - CRITICAL
- **Purpose**: Static assets served by Next.js
- **Required by**: Vercel build process
- **Contains**: Favicon, images, HTML test files
- **Status**: MUST STAY at root

### ✅ `middleware.ts` - CRITICAL
- **Purpose**: Next.js middleware for Supabase session management
- **Required by**: Auth flow, protected routes
- **Status**: MUST STAY at root

### ✅ Configuration Files - CRITICAL
- **next.config.ts** - Next.js build config
- **tsconfig.json** - TypeScript paths and compilation
- **package.json** - Dependencies and build scripts
- **tailwind.config.ts** - Styling framework
- **postcss.config.mjs** - CSS processing
- **jest.config.cjs** - Test runner config

---

## NON-CRITICAL FOLDERS (Safe to Migrate)

### ⚠️ `working-email-templates/` - NOT CRITICAL
**Current Status**: 2 HTML email templates at root
```
working-email-templates/
├── supabase-confirm-signup-template.html
└── supabase-password-reset-template.html
```

**Analysis**:
- ✅ Not imported by any TypeScript/JavaScript code
- ✅ Not required for Vercel build
- ✅ Reference/documentation material
- 🔄 Suggest moving: `docs/email-templates/`

**Migration Path**: 
```
working-email-templates/ → docs/email-templates/
```

---

### ⚠️ `types/cdp.ts` - SEMI-CRITICAL (Can be better organized)
**Current Status**: Separate `types/` folder at root
```
types/
└── cdp.ts
```

**Analysis**:
- ✅ TypeScript types file
- ❌ NOT currently imported anywhere in codebase (after search)
- ❌ Duplicated: Similar types exist in `lib/types.ts` (CDPNetworkAccount)
- ⚠️ Could be consolidation candidate OR move to `lib/types/`

**Recommendation**: Move to `lib/types/cdp.ts` and consolidate with existing types
- Cleaner structure (all types in lib/)
- Reduces root clutter
- Update tsconfig.json if needed

**Migration Path**:
```
types/cdp.ts → lib/types/cdp.ts
Update tsconfig.json paths if needed
```

---

### ⚠️ `artifacts/` - NOT CRITICAL FOR VERCEL
**Current Status**: Smart contract build artifacts at root
```
artifacts/
├── artifacts.d.ts
├── build-info/
│   └── solc-*.json
└── contracts/
    ├── SimpleERC721.sol/
    │   ├── artifacts.d.ts
    │   └── SimpleERC721.json
    └── SimpleNFT.sol/
        ├── artifacts.d.ts
        └── SimpleNFT.json
```

**Analysis**:
- ✅ Hardhat output artifacts
- ✅ Not required for Vercel runtime
- ❌ Not imported by any app code
- ✅ Development/build output only
- ⚠️ Should be in .gitignore (consider if needed in repo)

**Recommendation**: Move to `build/artifacts/` or `scripts/build-artifacts/`
- Separates build outputs from source
- Keeps root clean
- Easily .gitignore-able

**Migration Path**:
```
artifacts/ → build/artifacts/
Update hardhat.config.js artifactsPath if needed
```

---

### ⚠️ `cache/` - NOT CRITICAL (Should be .gitignore-d)
**Current Status**: Build cache at root
```
cache/
├── build-info/
└── compile-cache.json
```

**Analysis**:
- ❌ Local build cache
- ❌ Should NOT be in git
- ❌ Not needed by Vercel
- ✅ Regenerated on each build

**Recommendation**: Move to `.cache/` (dot-folder) or just remove and .gitignore
- Automatically ignored by many tools
- Keeps build artifacts local-only
- Better build hygiene

**Note**: Check if this is in .gitignore; if not, just remove

---

### ⚠️ `contracts/` - REFERENCE ONLY
**Current Status**: Solidity smart contracts at root
```
contracts/
├── SimpleERC721.sol
└── SimpleNFT.sol
```

**Analysis**:
- ✅ Hardhat project source files
- ❌ Not required for Vercel/Next.js runtime
- ✅ Not imported by any JS/TS code
- ✅ Development/reference only

**Recommendation**: Move to `scripts/contracts/` or `dev/contracts/`
- Groups with Hardhat config
- Clarifies these are development artifacts
- Separates from runtime code

**Migration Path**:
```
contracts/ → scripts/contracts/
Update hardhat.config.js paths if needed
```

---

### ⚠️ `assets/` - DOCUMENTATION ONLY
**Current Status**: SVG/XML diagrams at root
```
assets/
├── 01-dev-process.svg & .xml
├── 02-ai-process.svg & .xml
├── 03-reward-flow.svg & .xml
├── 04-key-benefits.svg & .xml
├── 05-ai-assessment-system.svg & .xml
├── 06-system-architecture.svg & .xml
└── testprofile.png
```

**Analysis**:
- ✅ SVG diagrams and test images
- ❌ Not required for Vercel
- ❌ Not imported by any code
- ✅ Reference/documentation material
- ❌ Should not be served as static assets (use `public/` instead)

**Recommendation**: Move to `docs/assets/`
- Consolidates documentation materials
- Reduces root clutter
- Still accessible if needed

**Migration Path**:
```
assets/ → docs/assets/
Update any markdown links: ../assets/ → ./assets/
```

---

### ⚠️ `__tests__/` - DEVELOPMENT (Optional cleanup)
**Current Status**: Test files at root
```
__tests__/
├── integration/
├── production/
└── unit/
```

**Analysis**:
- ✅ Test files (useful)
- ⚠️ Could stay at root OR move to nested folder
- ❌ Not required for Vercel production
- ✅ Used during CI/CD

**Recommendation**: Can keep at root (standard convention) OR move to `test/`
- Current position is conventional
- Consider if Vercel needs to run tests (it typically doesn't)

**Migration Path** (Optional):
```
__tests__/ → test/ (or keep as is - it's a Jest convention)
Update jest.config.cjs if moved
```

---

### ⚠️ `supabase/` - EMPTY (Can remove or keep as placeholder)
**Current Status**: Empty folder at root
```
supabase/ (no files)
```

**Analysis**:
- ❌ Currently empty
- ⚠️ Could be for Supabase config in future
- ✅ Not breaking anything

**Recommendation**: Keep as placeholder or remove
- If planning to use Supabase CLI, keep for config
- Otherwise, can safely remove

---

### ⚠️ Config/Documentation Files
**Current Status**: Root level markdown and config files
```
env-example.txt
PRODUCTION-DEPLOYMENT-GUIDE.md
vercel-env-variables.txt
deploy-to-vercel.sh
```

**Analysis**:
- ✅ Deployment guides and examples
- ❌ Not required by Vercel build
- ✅ Useful reference material

**Recommendation**: Can stay at root (they're documentation) or move to `docs/`
- Less critical to move
- Reasonable at root for visibility
- Consider developer experience

---

## MIGRATION SUMMARY TABLE

| Folder | Current | Target | Priority | Risk | Impact |
|--------|---------|--------|----------|------|--------|
| `app/` | Root | Root | N/A | N/A | CRITICAL |
| `components/` | Root | Root | N/A | N/A | CRITICAL |
| `lib/` | Root | Root | N/A | N/A | CRITICAL |
| `public/` | Root | Root | N/A | N/A | CRITICAL |
| `working-email-templates/` | Root | `docs/email-templates/` | Medium | LOW | None |
| `types/cdp.ts` | `types/` | `lib/types/cdp.ts` | Medium | MEDIUM | Requires import updates |
| `artifacts/` | Root | `build/artifacts/` | Medium | LOW | Update hardhat.config.js |
| `cache/` | Root | Remove/`.cache/` | High | LOW | Auto-regenerated |
| `contracts/` | Root | `scripts/contracts/` | Medium | LOW | Update hardhat.config.js |
| `assets/` | Root | `docs/assets/` | Medium | LOW | Update markdown links |
| `__tests__/` | Root | Root (keep) | N/A | N/A | Jest convention |
| `supabase/` | Root | Keep/Remove | Low | NONE | Empty |

---

## VERCEL BUILD SAFETY CHECKLIST

Before migration:
- ✅ Review tsconfig.json paths
- ✅ Check all import statements  
- ✅ Verify Next.js config references
- ✅ Ensure .gitignore coverage

After migration:
- ✅ Run `npm run build`
- ✅ Test locally: `npm run dev`
- ✅ Verify no import errors
- ✅ Check Vercel preview deployment

---

## Execution Order (Safest to Most Complex)

1. **Move `cache/` → `.cache/` or remove** (auto-regenerated)
2. **Move `working-email-templates/` → `docs/email-templates/`** (no imports)
3. **Move `assets/` → `docs/assets/`** (no imports, update markdown only)
4. **Move `contracts/` → `scripts/contracts/`** (update hardhat config)
5. **Move `artifacts/` → `build/artifacts/`** (update hardhat config, verify .gitignore)
6. **Move `types/cdp.ts` → `lib/types/cdp.ts`** (consolidate with lib/types.ts)
7. **Verify build and test Vercel**

---

## Expected Result

**Before**:
```
PROJECT_ROOT/
├── __tests__/
├── app/
├── artifacts/          ← NON-CRITICAL
├── assets/             ← NON-CRITICAL
├── cache/              ← NON-CRITICAL
├── components/
├── contracts/          ← NON-CRITICAL
├── docs/
├── lib/
├── public/
├── scripts/
├── supabase/           ← EMPTY
├── types/              ← SEMI-CRITICAL
├── working-email-templates/ ← NON-CRITICAL
├── [config files]
└── [markdown files]    ← DOCUMENTATION
```

**After**:
```
PROJECT_ROOT/
├── __tests__/
├── app/
├── build/              ← NEW: Build artifacts
│   └── artifacts/
├── components/
├── docs/               ← EXPANDED
│   ├── assets/
│   ├── email-templates/
│   └── [existing docs]
├── lib/                ← EXPANDED
│   ├── types/
│   │   ├── cdp.ts
│   │   └── [existing]
│   └── [existing]
├── public/
├── scripts/            ← EXPANDED
│   ├── contracts/
│   └── [existing]
├── [config files]      ← UNCHANGED
└── [markdown files]    ← REFERENCE
```

**Result**: 
- ✅ Cleaner root (8 non-config folders → 6)
- ✅ Better organization (related items grouped)
- ✅ Vercel-ready (no build-breaking changes)
- ✅ Easier to navigate
