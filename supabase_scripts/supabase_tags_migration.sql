-- Migration script to refactor tags from JSONB to separate table
-- This creates cuvinteziTags table and cuvinteziCuvinteTags junction table
-- Then migrates all existing tags from cuvinteziCuvinte.tags JSONB field

-- Step 0: Drop existing tables and policies if they exist (to recreate with new structure)
DROP POLICY IF EXISTS "Anyone can view word-tag relationships" ON public."cuvinteziCuvinteTags";
DROP POLICY IF EXISTS "Authenticated users can insert word-tag relationships" ON public."cuvinteziCuvinteTags";
DROP POLICY IF EXISTS "Anyone can view tags" ON public."cuvinteziTags";
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public."cuvinteziTags";

DROP TABLE IF EXISTS public."cuvinteziCuvinteTags";
DROP TABLE IF EXISTS public."cuvinteziTags";

-- Step 1: Create cuvinteziTags table with new structure
CREATE TABLE public."cuvinteziTags" (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for lookups
CREATE INDEX "cuvinteziTags_slug_idx" ON public."cuvinteziTags"(slug);
CREATE INDEX "cuvinteziTags_label_idx" ON public."cuvinteziTags"(label);

-- Step 2: Create junction table for many-to-many relationship
CREATE TABLE public."cuvinteziCuvinteTags" (
  word_id TEXT NOT NULL REFERENCES public."cuvinteziCuvinte"(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public."cuvinteziTags"(id) ON DELETE CASCADE,
  PRIMARY KEY (word_id, tag_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinteTags_word_id_idx" ON public."cuvinteziCuvinteTags"(word_id);
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinteTags_tag_id_idx" ON public."cuvinteziCuvinteTags"(tag_id);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziTags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."cuvinteziCuvinteTags" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cuvinteziTags
CREATE POLICY "Anyone can view tags"
ON public."cuvinteziTags"
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert tags"
ON public."cuvinteziTags"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for cuvinteziCuvinteTags
CREATE POLICY "Anyone can view word-tag relationships"
ON public."cuvinteziCuvinteTags"
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert word-tag relationships"
ON public."cuvinteziCuvinteTags"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Step 3: Extract all unique tags from cuvinteziCuvinte.tags and insert into cuvinteziTags
-- Generate slug by normalizing Romanian characters to ASCII equivalents
INSERT INTO public."cuvinteziTags" (slug, label)
SELECT DISTINCT
  LOWER(
    TRANSLATE(
      tag_value::text,
      'ăâîșțĂÂÎȘȚ',
      'aaisAIS'
    )
  ) AS slug,
  tag_value::text AS label
FROM public."cuvinteziCuvinte",
  jsonb_array_elements_text(tags) AS tag_value
WHERE tags IS NOT NULL 
  AND jsonb_array_length(tags) > 0
  AND tag_value::text IS NOT NULL
  AND tag_value::text != ''
ON CONFLICT (slug) DO NOTHING;

-- Step 4: Populate junction table with word-tag relationships
INSERT INTO public."cuvinteziCuvinteTags" (word_id, tag_id)
SELECT DISTINCT
  w.id AS word_id,
  t.id AS tag_id
FROM public."cuvinteziCuvinte" w,
  jsonb_array_elements_text(w.tags) AS tag_value
  INNER JOIN public."cuvinteziTags" t ON t.slug = LOWER(
    TRANSLATE(
      tag_value::text,
      'ăâîșțĂÂÎȘȚ',
      'aaisAIS'
    )
  )
WHERE w.tags IS NOT NULL 
  AND jsonb_array_length(w.tags) > 0
  AND tag_value::text IS NOT NULL
  AND tag_value::text != ''
ON CONFLICT (word_id, tag_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE public."cuvinteziTags" IS 'Stores all unique tags used for vocabulary words';
COMMENT ON COLUMN public."cuvinteziTags".id IS 'Auto-incrementing unique identifier for the tag';
COMMENT ON COLUMN public."cuvinteziTags".slug IS 'Normalized, lowercase slug for the tag (e.g., "emotii" for "emoții")';
COMMENT ON COLUMN public."cuvinteziTags".label IS 'The tag text as it appears (e.g., "emoții", "cultură")';
COMMENT ON TABLE public."cuvinteziCuvinteTags" IS 'Junction table linking words to tags (many-to-many relationship)';

