-- Create the cuvinteziCuvinte table for vocabulary words
-- Based on the structure from fallbackVocabulary.ro.json

CREATE TABLE IF NOT EXISTS public."cuvinteziCuvinte" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  grammar_block TEXT,
  definition TEXT NOT NULL,
  image TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  examples JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinte_title_idx" ON public."cuvinteziCuvinte"(title);
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinte_grammar_block_idx" ON public."cuvinteziCuvinte"(grammar_block);
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinte_tags_idx" ON public."cuvinteziCuvinte" USING GIN(tags);
CREATE INDEX IF NOT EXISTS "cuvinteziCuvinte_created_at_idx" ON public."cuvinteziCuvinte"(created_at);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziCuvinte" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view vocabulary words (public read access)
CREATE POLICY "Anyone can view vocabulary words"
ON public."cuvinteziCuvinte"
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert words (optional - adjust as needed)
CREATE POLICY "Authenticated users can insert words"
ON public."cuvinteziCuvinte"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update words (optional - adjust as needed)
CREATE POLICY "Authenticated users can update words"
ON public."cuvinteziCuvinte"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete words (optional - adjust as needed)
CREATE POLICY "Authenticated users can delete words"
ON public."cuvinteziCuvinte"
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cuvinte_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cuvinteziCuvinte_updated_at
  BEFORE UPDATE ON public."cuvinteziCuvinte"
  FOR EACH ROW
  EXECUTE FUNCTION update_cuvinte_updated_at();

-- Optional: Add comments to document the table structure
COMMENT ON TABLE public."cuvinteziCuvinte" IS 'Stores vocabulary words with definitions, examples, and metadata';
COMMENT ON COLUMN public."cuvinteziCuvinte".id IS 'Unique identifier for the word (e.g., "dor-1", "ragaz-2")';
COMMENT ON COLUMN public."cuvinteziCuvinte".title IS 'The word itself (e.g., "dor", "răgaz")';
COMMENT ON COLUMN public."cuvinteziCuvinte".grammar_block IS 'Grammatical information (e.g., "substantiv (n.)", "verb (infinitiv)")';
COMMENT ON COLUMN public."cuvinteziCuvinte".definition IS 'Detailed definition/explanation of the word';
COMMENT ON COLUMN public."cuvinteziCuvinte".image IS 'URL to an image representing the word';
COMMENT ON COLUMN public."cuvinteziCuvinte".tags IS 'Array of tags as JSONB (e.g., ["emoții", "cultură", "nostalgie"])';
COMMENT ON COLUMN public."cuvinteziCuvinte".examples IS 'Array of example sentences as JSONB (may contain HTML like <strong>)';

