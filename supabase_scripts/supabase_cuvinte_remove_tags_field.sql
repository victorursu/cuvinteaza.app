-- Migration script to remove the tags JSONB field from cuvinteziCuvinte table
-- This field has been replaced by the cuvinteziTags and cuvinteziCuvinteTags tables
-- All application code now uses the junction table instead of the JSONB field

BEGIN;

-- Step 1: Drop the GIN index on the tags field (if it exists)
DROP INDEX IF EXISTS public."cuvinteziCuvinte_tags_idx";

-- Step 2: Remove the tags column from cuvinteziCuvinte table
ALTER TABLE public."cuvinteziCuvinte"
DROP COLUMN IF EXISTS tags;

-- Step 3: Add a comment documenting the change
COMMENT ON TABLE public."cuvinteziCuvinte" IS 'Stores vocabulary words with definitions, examples, and metadata. Tags are now stored in cuvinteziTags and cuvinteziCuvinteTags tables.';

COMMIT;

