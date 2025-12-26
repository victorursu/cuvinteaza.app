-- Migration script to add slug column to cuvinteziCuvinte table
-- Generates slugs from the title field (normalized, lowercase, hyphenated)

-- Step 1: Add slug column
ALTER TABLE public."cuvinteziCuvinte"
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug_from_title(title_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      TRANSLATE(
        TRIM(title_text),
        'ăâîșțĂÂÎȘȚ',
        'aaisAIS'
      ),
      '[^a-z0-9]+',
      '-',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Populate slug for all existing rows
UPDATE public."cuvinteziCuvinte"
SET slug = generate_slug_from_title(title)
WHERE slug IS NULL;

-- Step 4: Handle potential duplicates by appending a number
-- If there are duplicate slugs, append a sequential number
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  base_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
    FROM public."cuvinteziCuvinte"
    WHERE slug IN (
      SELECT slug FROM public."cuvinteziCuvinte"
      GROUP BY slug HAVING COUNT(*) > 1
    )
  LOOP
    IF rec.rn > 1 THEN
      base_slug := rec.slug;
      counter := 1;
      -- Find a unique slug by appending numbers
      WHILE EXISTS (
        SELECT 1 FROM public."cuvinteziCuvinte"
        WHERE slug = base_slug || '-' || counter::TEXT
          AND id != rec.id
      ) LOOP
        counter := counter + 1;
      END LOOP;
      
      UPDATE public."cuvinteziCuvinte"
      SET slug = base_slug || '-' || counter::TEXT
      WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Step 5: Make slug NOT NULL and UNIQUE
ALTER TABLE public."cuvinteziCuvinte"
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
ALTER TABLE public."cuvinteziCuvinte"
ADD CONSTRAINT "cuvinteziCuvinte_slug_unique" UNIQUE (slug);

-- Step 6: Add index for slug lookups
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinte_slug_idx" ON public."cuvinteziCuvinte"(slug);

-- Step 7: Create a trigger to auto-generate slug on insert/update if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  counter INTEGER;
  final_slug TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title) THEN
    base_slug := generate_slug_from_title(NEW.title);
    final_slug := base_slug;
    counter := 1;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (
      SELECT 1 FROM public."cuvinteziCuvinte"
      WHERE slug = final_slug 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) LOOP
      final_slug := base_slug || '-' || counter::TEXT;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_generate_slug_trigger ON public."cuvinteziCuvinte";
CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT OR UPDATE OF title ON public."cuvinteziCuvinte"
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Add comment
COMMENT ON COLUMN public."cuvinteziCuvinte".slug IS 'URL-friendly slug generated from title (normalized, lowercase, hyphenated)';

