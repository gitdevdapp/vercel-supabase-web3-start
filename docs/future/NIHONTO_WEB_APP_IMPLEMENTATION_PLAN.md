# NIHONTO SWORD IDENTIFICATION WEB APP - IMPLEMENTATION PLAN

## 🎯 **PROJECT OVERVIEW**

**Goal**: Transform the nihonto database analysis into an interactive web application where users can input sword dimensions and characteristics to find the closest matching historical blades.

**Tech Stack** (Vercel + Supabase Free Tier Compatible):
- **Frontend**: Next.js 14+ (React framework with App Router)
- **Backend**: Supabase (PostgreSQL database + Auth + Edge Functions)
- **Hosting**: Vercel (serverless deployment)
- **Styling**: Tailwind CSS
- **Data**: 16,591 sword records with full dimensional analysis

**Critical Constraint**: All operations must fit within Vercel and Supabase free tier limits.

---

## 🚨 **FREE TIER LIMITS & OPTIMIZATION**

### Supabase Free Tier Limits:
- **Database**: 500MB storage, 2GB bandwidth/month
- **Edge Functions**: 500,000 invocations/month, 100 hours compute
- **Database Queries**: 50 million row reads/month, 5 million row writes/month
- **Concurrent Connections**: 10

### Vercel Free Tier Limits:
- **Serverless Functions**: 100GB-hours/month, 1000GB bandwidth
- **Build Time**: 100 hours/month
- **Static Assets**: No specific limit

### Optimization Strategy:

1. **Database Queries**:
   - Use pagination for all list queries (limit 50-100 per page)
   - Implement query result caching (24-hour TTL)
   - Pre-compute expensive calculations (z-scores, distances)
   - Use database indexes strategically

2. **Search Algorithm**:
   - Limit search results to top 50 matches
   - Pre-filter by blade type before complex calculations
   - Use database-side filtering when possible

3. **Edge Functions**:
   - Use for search calculations only (not data storage)
   - Keep functions under 10 seconds execution time
   - Batch operations to minimize invocations

4. **Frontend Optimization**:
   - Static generation for non-dynamic pages
   - Client-side search for simple filters
   - Debounced search inputs

---

## 📊 **PHASE 0: DATA PREPARATION** (Pre-Development)

### 0.1 Database Schema Design

**Tables to Create:**

1. **`blades`** (main sword records - 16,591 rows)
```sql
CREATE TABLE blades (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- tachi, katana, tanto, wakizashi, etc.
  length DECIMAL(5,2), -- cm
  curvature DECIMAL(4,2), -- cm
  moto_haba DECIMAL(4,2), -- cm
  saki_haba DECIMAL(4,2), -- cm
  school TEXT,
  smith TEXT,
  signature TEXT,
  era TEXT,
  province TEXT,
  tang_condition TEXT,
  nakago_length DECIMAL(4,2),
  horimono TEXT,
  location TEXT,
  references TEXT,
  history TEXT,
  notes TEXT,
  importance_score INTEGER DEFAULT 0,
  rarity_score DECIMAL(5,2),
  z_score_length DECIMAL(6,3),
  z_score_curvature DECIMAL(6,3),
  z_score_moto DECIMAL(6,3),
  z_score_saki DECIMAL(6,3),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **`schools`** (637 schools)
```sql
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  total_count INTEGER NOT NULL,
  rarity_score DECIMAL(5,2) NOT NULL,
  percentage_of_database DECIMAL(5,2),
  most_common_type TEXT,
  era_range TEXT,
  tachi_avg_length DECIMAL(5,2),
  tachi_avg_curvature DECIMAL(4,2),
  tachi_std_length DECIMAL(5,2),
  katana_avg_length DECIMAL(5,2),
  katana_avg_curvature DECIMAL(4,2),
  tanto_avg_length DECIMAL(5,2),
  tanto_avg_curvature DECIMAL(4,2),
  wakizashi_avg_length DECIMAL(5,2),
  wakizashi_avg_curvature DECIMAL(4,2)
);
```

3. **`era_measurements`** (904 era/type combinations)
```sql
CREATE TABLE era_measurements (
  id SERIAL PRIMARY KEY,
  era TEXT NOT NULL,
  blade_type TEXT NOT NULL,
  count INTEGER NOT NULL,
  avg_length DECIMAL(5,2),
  std_length DECIMAL(5,2),
  min_length DECIMAL(5,2),
  max_length DECIMAL(5,2),
  avg_curvature DECIMAL(4,2),
  std_curvature DECIMAL(4,2),
  avg_moto_haba DECIMAL(4,2),
  avg_saki_haba DECIMAL(4,2),
  UNIQUE(era, blade_type)
);
```

4. **`search_cache`** (performance optimization)
```sql
CREATE TABLE search_cache (
  id SERIAL PRIMARY KEY,
  search_hash TEXT UNIQUE NOT NULL,
  search_params JSONB,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### 0.2 Database Indexes (Critical for Performance)

**Essential Indexes:**
```sql
-- Primary search dimensions
CREATE INDEX idx_blades_type_length ON blades (type, length);
CREATE INDEX idx_blades_type_curvature ON blades (type, curvature);
CREATE INDEX idx_blades_school ON blades (school);
CREATE INDEX idx_blades_smith ON blades (smith);

-- Composite index for multi-dimensional searches
CREATE INDEX idx_blades_search ON blades (type, length, curvature, moto_haba);

-- Text search for smith/school lookup
CREATE INDEX idx_blades_text_search ON blades USING GIN (to_tsvector('english', smith || ' ' || school || ' ' || signature));

-- Cache cleanup index
CREATE INDEX idx_search_cache_expires ON search_cache (expires_at);
```

### 0.3 Data Import Strategy

**Import Script Features:**
- Batch inserts (1000 rows per transaction)
- Progress tracking and resume capability
- Data validation before import
- Index creation after import completion

**Estimated Import Time:** ~5-10 minutes for all data

---

## 🎨 **PHASE 1: FRONTEND UI DESIGN**

### 1.1 Page Structure

**Pages (Next.js App Router):**

1. **Home/Landing** (`/`)
   ```jsx
   // Static generation - no database calls
   export default function Home() {
     return (
       <div className="container mx-auto px-4">
         <Hero stats={{
           totalBlades: 16591,
           totalSchools: 637,
           totalSmiths: 1765
         }} />
         <QuickSearchPreview />
       </div>
     );
   }
   ```

2. **Search Page** (`/search`)
   ```jsx
   // Client-side state management, server-side only for initial load
   export default function Search() {
     const [searchParams, setSearchParams] = useState({});
     const [results, setResults] = useState([]);

     // Debounced search function
     const debouncedSearch = useCallback(
       debounce(async (params) => {
         const response = await fetch('/api/search', {
           method: 'POST',
           body: JSON.stringify(params)
         });
         const data = await response.json();
         setResults(data.results);
       }, 300),
       []
     );

     useEffect(() => {
       if (Object.keys(searchParams).length > 0) {
         debouncedSearch(searchParams);
       }
     }, [searchParams]);
   }
   ```

3. **Blade Detail** (`/blade/[id]`)
   ```jsx
   // Static generation with fallback
   export async function generateStaticParams() {
     // Pre-generate top 100 most important blades
     const { data } = await supabase
       .from('blades')
       .select('id')
       .order('importance_score', { ascending: false })
       .limit(100);

     return data.map((blade) => ({
       id: blade.id.toString(),
     }));
   }

   export default async function BladeDetail({ params }) {
     const { data: blade } = await supabase
       .from('blades')
       .select('*')
       .eq('id', params.id)
       .single();

     if (!blade) notFound();

     return <BladeDetailPage blade={blade} />;
   }
   ```

4. **Browse** (`/browse`)
   ```jsx
   // Server-side pagination
   export default async function Browse({ searchParams }) {
     const page = parseInt(searchParams.page) || 1;
     const limit = 50; // Stay within free tier limits

     const { data: blades, count } = await supabase
       .from('blades')
       .select('*', { count: 'exact' })
       .order('importance_score', { ascending: false })
       .range((page - 1) * limit, page * limit - 1);

     return (
       <BrowsePage
         blades={blades}
         totalCount={count}
         currentPage={page}
         totalPages={Math.ceil(count / limit)}
       />
     );
   }
   ```

### 1.2 UI Components

**Search Form Component:**
```jsx
// Client component with controlled inputs
function SearchForm({ onSearch }) {
  const [formData, setFormData] = useState({
    type: '',
    length: '',
    curvature: '',
    motoHaba: '',
    sakiHaba: '',
    school: '',
    era: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Blade type selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Tachi', 'Katana', 'Tanto', 'Wakizashi'].map((type) => (
          <button
            key={type}
            type="button"
            className={`p-4 border rounded-lg ${
              formData.type === type ? 'bg-blue-100 border-blue-500' : 'bg-white'
            }`}
            onClick={() => setFormData({...formData, type})}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Length (cm)</label>
          <input
            type="number"
            step="0.1"
            className="w-full p-2 border rounded"
            value={formData.length}
            onChange={(e) => setFormData({...formData, length: e.target.value})}
          />
        </div>
        {/* Similar inputs for curvature, moto_haba, saki_haba */}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
      >
        Find Matching Blades
      </button>
    </form>
  );
}
```

**Results Display Component:**
```jsx
function SearchResults({ results, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {results.length} matching blades found
        </h3>
        <select className="border rounded p-2">
          <option>Sort by Similarity</option>
          <option>Sort by Importance</option>
          <option>Sort by Rarity</option>
        </select>
      </div>

      <div className="grid gap-4">
        {results.slice(0, 20).map((blade) => ( // Limit display to 20
          <BladeCard key={blade.id} blade={blade} />
        ))}
      </div>

      {results.length > 20 && (
        <div className="text-center py-4">
          <button className="text-blue-600 hover:text-blue-800">
            Show {results.length - 20} more results...
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 **PHASE 2: SEARCH ALGORITHM & API**

### 2.1 Search API Endpoint (`/api/search`)

**Edge Function (Vercel/Supabase):**
```javascript
// /api/search/route.js
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const searchParams = await request.json();

  // Validate and sanitize inputs
  const { type, length, curvature, motoHaba, sakiHaba, school, era } = searchParams;

  if (!type || !length) {
    return Response.json({ error: 'Type and length are required' }, { status: 400 });
  }

  // Check cache first (24-hour TTL)
  const searchHash = generateSearchHash(searchParams);
  const { data: cached } = await supabase
    .from('search_cache')
    .select('results')
    .eq('search_hash', searchHash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cached) {
    return Response.json({ results: cached.results, cached: true });
  }

  // Build query with filters
  let query = supabase
    .from('blades')
    .select('*')
    .eq('type', type)
    .limit(1000); // Limit to prevent excessive data transfer

  // Add dimension filters with reasonable ranges
  if (length) query = query.gte('length', length - 5).lte('length', length + 5);
  if (curvature) query = query.gte('curvature', curvature - 1).lte('curvature', curvature + 1);
  if (motoHaba) query = query.gte('moto_haba', motoHaba - 1).lte('moto_haba', motoHaba + 1);

  const { data: candidates } = await query;

  // Calculate similarity scores
  const results = candidates
    .map(blade => ({
      ...blade,
      similarity: calculateSimilarity(blade, searchParams)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 50); // Return top 50 matches

  // Cache results for 24 hours
  await supabase.from('search_cache').upsert({
    search_hash: searchHash,
    search_params: searchParams,
    results: results,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  return Response.json({ results, cached: false });
}

function calculateSimilarity(blade, params) {
  // Weighted Euclidean distance calculation
  const lengthDiff = Math.abs(blade.length - params.length);
  const curvatureDiff = Math.abs(blade.curvature - params.curvature || 0);
  const motoDiff = Math.abs(blade.moto_haba - params.motoHaba || 0);

  // Weighted scoring (length is most important)
  const score = 100 - (
    lengthDiff * 10 +
    curvatureDiff * 5 +
    motoDiff * 3
  );

  return Math.max(0, score);
}
```

### 2.2 Similarity Algorithm

**Multi-dimensional Matching:**
```javascript
function calculateSimilarity(blade, searchParams) {
  let totalScore = 0;
  let maxScore = 0;

  // Length similarity (40% weight)
  if (searchParams.length && blade.length) {
    const lengthDiff = Math.abs(blade.length - searchParams.length);
    const lengthScore = Math.max(0, 100 - (lengthDiff * 20)); // Penalize 20 points per cm
    totalScore += lengthScore * 0.4;
    maxScore += 100 * 0.4;
  }

  // Curvature similarity (30% weight)
  if (searchParams.curvature && blade.curvature) {
    const curveDiff = Math.abs(blade.curvature - searchParams.curvature);
    const curveScore = Math.max(0, 100 - (curveDiff * 50)); // Penalize 50 points per cm
    totalScore += curveScore * 0.3;
    maxScore += 100 * 0.3;
  }

  // Width similarity (20% weight)
  if (searchParams.motoHaba && blade.moto_haba) {
    const widthDiff = Math.abs(blade.moto_haba - searchParams.motoHaba);
    const widthScore = Math.max(0, 100 - (widthDiff * 25));
    totalScore += widthScore * 0.2;
    maxScore += 100 * 0.2;
  }

  // School bonus (10% weight)
  if (searchParams.school && blade.school === searchParams.school) {
    totalScore += 100 * 0.1;
    maxScore += 100 * 0.1;
  }

  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
}
```

---

## 📈 **PHASE 3: PERFORMANCE OPTIMIZATION**

### 3.1 Database Query Optimization

**Pre-computed Z-Scores:**
```sql
-- Add computed columns to blades table
ALTER TABLE blades ADD COLUMN z_score_length DECIMAL(6,3);
ALTER TABLE blades ADD COLUMN z_score_curvature DECIMAL(6,3);
ALTER TABLE blades ADD COLUMN z_score_moto DECIMAL(6,3);
ALTER TABLE blades ADD COLUMN z_score_saki DECIMAL(6,3);

-- Update with pre-computed z-scores (run once during import)
UPDATE blades SET
  z_score_length = (length - school_avg_length) / school_std_length,
  z_score_curvature = (curvature - school_avg_curvature) / school_std_curvature,
  -- etc.
FROM (
  SELECT school, AVG(length) as school_avg_length, STDDEV(length) as school_std_length
  FROM blades GROUP BY school
) stats
WHERE blades.school = stats.school;
```

**Optimized Search Query:**
```sql
-- Use pre-computed z-scores for faster similarity calculation
SELECT *,
  -- Similarity score calculation happens in database
  (100 - (
    ABS(z_score_length - $1) * 20 +
    ABS(z_score_curvature - $2) * 15 +
    ABS(z_score_moto - $3) * 10
  )) as similarity_score
FROM blades
WHERE type = $4
  AND length BETWEEN $5 AND $6
  AND z_score_length BETWEEN -3 AND 3 -- Reasonable range
ORDER BY similarity_score DESC
LIMIT 50;
```

### 3.2 Caching Strategy

**Multi-Level Caching:**
1. **Browser Cache**: Static assets cached for 1 hour
2. **CDN Cache**: Vercel edge cache for 1 minute
3. **Database Cache**: Search results cached for 24 hours
4. **Memory Cache**: Popular searches kept in Edge Function memory

**Cache Invalidation:**
- Automatic cleanup of expired cache entries
- Manual cache refresh for data updates
- Cache warming for popular searches

### 3.3 Pagination Strategy

**Efficient Pagination:**
```javascript
// Server-side pagination with cursor-based approach
export async function getBlades(page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('blades')
    .select('*', { count: 'exact' })
    .order('importance_score', { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    blades: data,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    hasNext: offset + limit < count,
    hasPrev: page > 1
  };
}
```

---

## 🚀 **PHASE 4: DEPLOYMENT & CONFIGURATION**

### 4.1 Vercel Configuration

**vercel.json:**
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

### 4.2 Environment Variables

**Required Environment Variables:**
```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 4.3 Database Setup Script

**setup-database.js:**
```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  // Create tables
  await createTables();

  // Import data
  await importSchools();
  await importEraMeasurements();
  await importBlades();

  // Create indexes
  await createIndexes();

  console.log('Database setup complete!');
}

setupDatabase();
```

---

## 📱 **PHASE 5: ADVANCED FEATURES**

### 5.1 Advanced Search Filters

**Filter Component:**
```jsx
function AdvancedFilters({ filters, onChange }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h4 className="font-semibold">Advanced Filters</h4>

      {/* Era filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Era</label>
        <select
          className="w-full p-2 border rounded"
          value={filters.era || ''}
          onChange={(e) => onChange({...filters, era: e.target.value})}
        >
          <option value="">Any Era</option>
          <option value="Late Heian">Late Heian</option>
          <option value="Early Kamakura">Early Kamakura</option>
          {/* Add more eras */}
        </select>
      </div>

      {/* Province filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Province</label>
        <select className="w-full p-2 border rounded">
          <option value="">Any Province</option>
          {/* Populate from database */}
        </select>
      </div>

      {/* Rarity range */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rarity Score: {filters.minRarity || 0} - {filters.maxRarity || 100}
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minRarity || 0}
            onChange={(e) => onChange({...filters, minRarity: parseInt(e.target.value)})}
            className="flex-1"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maxRarity || 100}
            onChange={(e) => onChange({...filters, maxRarity: parseInt(e.target.value)})}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Statistical Analysis

**Authentication Scoring:**
```javascript
// Edge function for detailed analysis
export async function POST(req) {
  const { bladeData } = await req.json();

  // Calculate 10-point authentication score
  const authScore = await calculateAuthenticationScore(bladeData);

  return Response.json({
    score: authScore,
    breakdown: {
      dimensional: authScore.dimensional,
      proportional: authScore.proportional,
      era: authScore.era,
      provincial: authScore.provincial,
      rarity: authScore.rarity,
      // etc.
    },
    recommendation: getRecommendation(authScore.total)
  });
}
```

---

## 🔒 **PHASE 6: SECURITY & VALIDATION**

### 6.1 Input Validation

**Comprehensive Validation:**
```javascript
function validateSearchInput(input) {
  const schema = {
    type: Joi.string().valid('Tachi', 'Katana', 'Tanto', 'Wakizashi', 'Odachi').required(),
    length: Joi.number().min(10).max(200).precision(2).required(),
    curvature: Joi.number().min(0).max(10).precision(2).optional(),
    motoHaba: Joi.number().min(1).max(10).precision(2).optional(),
    sakiHaba: Joi.number().min(1).max(10).precision(2).optional(),
    school: Joi.string().max(100).optional(),
    era: Joi.string().max(50).optional()
  };

  return Joi.validate(input, schema);
}
```

### 6.2 Rate Limiting

**API Rate Limiting:**
```javascript
// Middleware for rate limiting
export function rateLimit(handler) {
  return async (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const key = `rate_limit:${clientIP}`;

    // Simple in-memory rate limiting (for demo)
    // In production, use Redis or similar
    const requests = await getRequests(key);
    if (requests > 100) { // 100 requests per hour
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    await incrementRequests(key);
    return handler(req, res);
  };
}
```

---

## 📊 **PHASE 7: ANALYTICS & MONITORING**

### 7.1 Usage Analytics

**Track User Searches:**
```sql
-- Add to search_cache table
ALTER TABLE search_cache ADD COLUMN user_agent TEXT;
ALTER TABLE search_cache ADD COLUMN ip_hash TEXT;
ALTER TABLE search_cache ADD COLUMN search_count INTEGER DEFAULT 1;

-- Analytics queries
SELECT
  search_params->>'type' as blade_type,
  COUNT(*) as search_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600) as avg_hours_since
FROM search_cache
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY blade_type
ORDER BY search_count DESC;
```

### 7.2 Performance Monitoring

**Key Metrics to Track:**
- Search response times (target: < 500ms)
- Cache hit rates (target: > 80%)
- Database query performance
- Error rates
- Popular search patterns

---

## 🛠 **PHASE 8: MAINTENANCE & SCALING**

### 8.1 Database Maintenance

**Automated Tasks:**
```javascript
// Weekly maintenance script
async function weeklyMaintenance() {
  // Clean old cache entries
  await supabase
    .from('search_cache')
    .delete()
    .lt('expires_at', new Date().toISOString());

  // Update search statistics
  await updateSearchStats();

  // Vacuum and analyze tables
  await supabase.rpc('vacuum_analyze');
}
```

### 8.2 Scaling Considerations

**When to Upgrade from Free Tier:**
1. **Database**: When approaching 500MB storage limit
2. **Edge Functions**: When exceeding 500,000 monthly invocations
3. **Bandwidth**: When exceeding 2GB/month from Supabase

**Scaling Strategy:**
1. **Phase 1**: Optimize queries and caching (current)
2. **Phase 2**: Add Redis for session caching
3. **Phase 3**: Implement database read replicas
4. **Phase 4**: Consider upgrading to Supabase Pro

---

## 📋 **IMPLEMENTATION CHECKLIST**

### Pre-Launch (Week 1-2)
- [ ] Set up Vercel project with Next.js template
- [ ] Configure Supabase project and database
- [ ] Import and validate all data
- [ ] Create and test all database indexes
- [ ] Implement basic search functionality
- [ ] Test within free tier limits

### Core Features (Week 3-4)
- [ ] Complete search interface
- [ ] Results display and filtering
- [ ] Blade detail pages
- [ ] Basic caching implementation
- [ ] Error handling and validation

### Polish & Optimization (Week 5-6)
- [ ] Advanced search filters
- [ ] Performance optimization
- [ ] Analytics implementation
- [ ] Mobile responsiveness
- [ ] SEO optimization

### Testing & Launch (Week 7-8)
- [ ] Comprehensive testing
- [ ] Load testing within limits
- [ ] Documentation completion
- [ ] Beta testing
- [ ] Production deployment

---

## 🎯 **SUCCESS METRICS**

**Performance Targets:**
- Search response time: < 500ms average
- Cache hit rate: > 80%
- Database query efficiency: < 10ms for indexed queries
- Free tier limit utilization: < 50% of limits

**User Experience:**
- Zero crashes or timeouts
- Intuitive search interface
- Accurate matching results
- Mobile-friendly design

**Data Quality:**
- All 16,591 blades searchable
- Accurate similarity calculations
- Complete statistical context
- Regular data updates

This implementation plan ensures the Nihonto sword identification tool can be built and deployed entirely within Vercel and Supabase free tier limits while providing a professional, performant user experience.
