-- Migration script to change cuvinteziCuvinte.id from TEXT to BIGINT
-- This updates the primary key and all foreign key references

BEGIN;

-- Step 1: Add a new BIGINT id column to cuvinteziCuvinte (temporary name)
-- We'll use a sequence to generate values
CREATE SEQUENCE IF NOT EXISTS cuvintezi_cuvinte_new_id_seq;

ALTER TABLE public."cuvinteziCuvinte"
ADD COLUMN new_id BIGINT;

-- Step 2: Populate new_id with sequential values (preserving order by created_at or id)
-- Use a subquery to assign sequential numbers
UPDATE public."cuvinteziCuvinte" c
SET new_id = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
  FROM public."cuvinteziCuvinte"
) sub
WHERE c.id = sub.id;

-- Reset and set the sequence to continue from max value
SELECT setval('cuvintezi_cuvinte_new_id_seq', COALESCE(MAX(new_id), 1), true)
FROM public."cuvinteziCuvinte";

-- Set the sequence to start from the max value + 1
SELECT setval('cuvintezi_cuvinte_new_id_seq', COALESCE(MAX(new_id), 1), true)
FROM public."cuvinteziCuvinte";

-- Make it a serial column by setting default
ALTER TABLE public."cuvinteziCuvinte"
ALTER COLUMN new_id SET DEFAULT nextval('cuvintezi_cuvinte_new_id_seq');

-- Step 3: Create a mapping table to track old TEXT id -> new BIGINT id
CREATE TEMP TABLE id_mapping AS
SELECT id AS old_id, new_id
FROM public."cuvinteziCuvinte";

-- Step 4: Add temporary BIGINT columns to referencing tables
ALTER TABLE public."cuvinteziDailyWords"
ADD COLUMN word_id_new BIGINT;

ALTER TABLE public."cuvinteziLikes"
ADD COLUMN word_id_new BIGINT;

ALTER TABLE public."cuvinteziCuvinteTags"
ADD COLUMN word_id_new BIGINT;

-- Step 5: Populate the new columns in referencing tables using the mapping
UPDATE public."cuvinteziDailyWords" dw
SET word_id_new = m.new_id
FROM id_mapping m
WHERE dw.word_id = m.old_id;

UPDATE public."cuvinteziLikes" l
SET word_id_new = m.new_id
FROM id_mapping m
WHERE l.word_id = m.old_id;

UPDATE public."cuvinteziCuvinteTags" ct
SET word_id_new = m.new_id
FROM id_mapping m
WHERE ct.word_id = m.old_id;

-- Step 6: Drop foreign key constraints
ALTER TABLE public."cuvinteziDailyWords"
DROP CONSTRAINT IF EXISTS "cuvinteziDailyWords_word_id_fkey";

ALTER TABLE public."cuvinteziCuvinteTags"
DROP CONSTRAINT IF EXISTS "cuvinteziCuvinteTags_word_id_fkey";

-- Step 7: Drop old TEXT columns and indexes
DROP INDEX IF EXISTS public."cuvinteziDailyWords_word_id_idx";
DROP INDEX IF EXISTS public."cuvinteziLikes_word_id_idx";
DROP INDEX IF EXISTS public."cuvinteziCuvinteTags_word_id_idx";

ALTER TABLE public."cuvinteziDailyWords"
DROP COLUMN word_id;

ALTER TABLE public."cuvinteziLikes"
DROP COLUMN word_id;

ALTER TABLE public."cuvinteziCuvinteTags"
DROP COLUMN word_id;

-- Step 8: Rename new columns to original names
ALTER TABLE public."cuvinteziDailyWords"
RENAME COLUMN word_id_new TO word_id;

ALTER TABLE public."cuvinteziLikes"
RENAME COLUMN word_id_new TO word_id;

ALTER TABLE public."cuvinteziCuvinteTags"
RENAME COLUMN word_id_new TO word_id;

-- Step 9: Drop old PRIMARY KEY constraint and TEXT id column from cuvinteziCuvinte
ALTER TABLE public."cuvinteziCuvinte"
DROP CONSTRAINT IF EXISTS "cuvinteziCuvinte_pkey";

ALTER TABLE public."cuvinteziCuvinte"
DROP COLUMN id;

-- Step 10: Rename new_id to id and make it PRIMARY KEY
ALTER TABLE public."cuvinteziCuvinte"
RENAME COLUMN new_id TO id;

-- Rename the sequence to match the column
ALTER SEQUENCE cuvintezi_cuvinte_new_id_seq RENAME TO cuvintezi_cuvinte_id_seq;
ALTER SEQUENCE cuvintezi_cuvinte_id_seq OWNED BY public."cuvinteziCuvinte".id;

ALTER TABLE public."cuvinteziCuvinte"
ADD PRIMARY KEY (id);

-- Step 11: Make word_id columns NOT NULL and recreate foreign key constraints
ALTER TABLE public."cuvinteziDailyWords"
ALTER COLUMN word_id SET NOT NULL;

ALTER TABLE public."cuvinteziLikes"
ALTER COLUMN word_id SET NOT NULL;

ALTER TABLE public."cuvinteziCuvinteTags"
ALTER COLUMN word_id SET NOT NULL;

-- Recreate foreign key constraints
ALTER TABLE public."cuvinteziDailyWords"
ADD CONSTRAINT "cuvinteziDailyWords_word_id_fkey"
FOREIGN KEY (word_id) REFERENCES public."cuvinteziCuvinte"(id) ON DELETE CASCADE;

ALTER TABLE public."cuvinteziCuvinteTags"
ADD CONSTRAINT "cuvinteziCuvinteTags_word_id_fkey"
FOREIGN KEY (word_id) REFERENCES public."cuvinteziCuvinte"(id) ON DELETE CASCADE;

-- Step 12: Recreate indexes
CREATE INDEX "cuvinteziDailyWords_word_id_idx" ON public."cuvinteziDailyWords"(word_id);
CREATE INDEX "cuvinteziLikes_word_id_idx" ON public."cuvinteziLikes"(word_id);
CREATE INDEX "cuvinteziCuvinteTags_word_id_idx" ON public."cuvinteziCuvinteTags"(word_id);

-- Step 13: Update the PRIMARY KEY constraint name in cuvinteziCuvinteTags
-- (The composite primary key will be recreated automatically, but let's ensure it's correct)
ALTER TABLE public."cuvinteziCuvinteTags"
DROP CONSTRAINT IF EXISTS "cuvinteziCuvinteTags_pkey";

ALTER TABLE public."cuvinteziCuvinteTags"
ADD PRIMARY KEY (word_id, tag_id);

-- Step 14: Update comments
COMMENT ON COLUMN public."cuvinteziCuvinte".id IS 'Auto-incrementing unique identifier for the word (BIGINT)';
COMMENT ON COLUMN public."cuvinteziDailyWords".word_id IS 'Reference to cuvinteziCuvinte.id (BIGINT)';
COMMENT ON COLUMN public."cuvinteziLikes".word_id IS 'Reference to cuvinteziCuvinte.id (BIGINT)';
COMMENT ON COLUMN public."cuvinteziCuvinteTags".word_id IS 'Reference to cuvinteziCuvinte.id (BIGINT)';

COMMIT;

