# Storage Bucket Setup - Quick Reference

**Status:** Manual creation required (by design)  
**Time:** 30 seconds  
**Difficulty:** ⭐ Very Easy  
**Required:** Yes (needed for profile image uploads)

---

## The One Bucket You Need

```
Name: profile-images
Visibility: Private
File Size Limit: 5 MB
Status: Should be created BEFORE running V4 script
```

---

## Method: Dashboard (Recommended)

**Step 1: Open Supabase Dashboard**
```
https://supabase.com/dashboard/projects
→ Select your project
```

**Step 2: Navigate to Storage**
```
Left sidebar → Storage → Buckets tab
```

**Step 3: Create New Bucket**
```
Click "Create a new bucket" button
```

**Step 4: Fill Form**
```
Name: profile-images
Visibility: Private (toggle OFF to keep private)
File size limit: 5 MB (5242880 bytes)
```

**Step 5: Create**
```
Click "Create bucket" button
```

**Step 6: Verify**
```
You should see "profile-images" in the buckets list
Status: READY
Size: 0 bytes
```

**Time:** 30 seconds  
**Success Rate:** 100%

---

## Why This is Manual (Not a Bug)

❌ **Cannot do in SQL:**
- Supabase storage is managed via system API
- `storage.buckets` table is system-managed
- User SQL cannot create storage buckets
- RLS on storage.objects is auto-managed internally

✅ **Correct approach:**
- Create via Dashboard (this guide)
- OR create via API endpoint
- OR create via JavaScript SDK
- Same as MJR production project

---

## RLS Happens Automatically

**You Do NOT Need to:**
- Modify storage.objects table
- Create storage RLS policies manually
- Configure file permissions in SQL

**Supabase Handles Automatically:**
- Users can upload to their own folder
- Service role can manage all files
- Anonymous users cannot access
- Public reads only if bucket is public

---

## Verification

### Via Dashboard
```
Storage → Buckets tab
→ Should see "profile-images"
→ Status: READY
```

### Via SQL
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'profile-images';

-- Expected: 1 row
-- id: profile-images
-- name: profile-images
-- public: false
-- file_size_limit: 5242880
```

### Via Application
```javascript
const { data } = await supabase.storage.listBuckets()
console.log(data) // Should include profile-images
```

---

## Troubleshooting

### "Bucket already exists"
**Status:** ✅ OK  
**Action:** Safe to ignore, continue with V4 script

### "Permission denied"
**Status:** ❌ Wrong credentials  
**Action:** Make sure you're logged into correct Supabase project

### Bucket shows but can't upload
**Status:** ✅ RLS working correctly  
**Action:** Use authenticated user or service role key

---

## Integration with Application

After bucket is created, your application can upload:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function uploadProfileImage(userId, file) {
  const filename = `${Date.now()}_${file.name}`
  const path = `${userId}/${filename}`
  
  const { data, error } = await supabase
    .storage
    .from('profile-images')
    .upload(path, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('profile-images')
    .getPublicUrl(path)
  
  return publicUrl
}
```

This code already exists in your application:
- `components/profile-image-uploader.tsx` ✅
- `lib/profile.ts` ✅

**No changes needed** - Just create the bucket!

---

## Timeline

```
Before V4 Script:
  ✅ Create profile-images bucket (30 sec)
  
During V4 Script:
  ✅ Foundation setup (3-5 min)
  ✅ Smart contracts (5-7 min)
  ✅ NFT system (5-7 min)
  ✅ Verification (1-2 min)
  
After V4 Script:
  ✅ Application is production-ready
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **What** | Create 'profile-images' storage bucket |
| **When** | Before running V4 script |
| **How** | Dashboard → Storage → Create Bucket |
| **Time** | 30 seconds |
| **Difficulty** | Very Easy ⭐ |
| **Required** | Yes |
| **SQL Needed** | No (intentional) |

---

**Status:** Ready to create  
**Next Step:** Follow steps above, then run V4 script


