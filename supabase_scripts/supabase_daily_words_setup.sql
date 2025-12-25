-- Create the cuvinteziDailyWords table for daily word selections
-- This table stores one word per day

CREATE TABLE IF NOT EXISTS public."cuvinteziDailyWords" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id TEXT NOT NULL REFERENCES public."cuvinteziCuvinte"(id) ON DELETE CASCADE,
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziDailyWords_word_id_idx" ON public."cuvinteziDailyWords"(word_id);
CREATE INDEX IF NOT EXISTS "cuvinteziDailyWords_date_idx" ON public."cuvinteziDailyWords"(date);
CREATE INDEX IF NOT EXISTS "cuvinteziDailyWords_created_at_idx" ON public."cuvinteziDailyWords"(created_at);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziDailyWords" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view daily words (public read access)
CREATE POLICY "Anyone can view daily words"
ON public."cuvinteziDailyWords"
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert daily words
CREATE POLICY "Authenticated users can insert daily words"
ON public."cuvinteziDailyWords"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update daily words
CREATE POLICY "Authenticated users can update daily words"
ON public."cuvinteziDailyWords"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete daily words
CREATE POLICY "Authenticated users can delete daily words"
ON public."cuvinteziDailyWords"
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cuvinteziDailyWords_updated_at
BEFORE UPDATE ON public."cuvinteziDailyWords"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial daily words
-- Note: Using CURRENT_DATE for today, CURRENT_DATE - INTERVAL '1 day' for yesterday, etc.

INSERT INTO public."cuvinteziDailyWords" (word_id, date)
VALUES
  ('incropi-14', CURRENT_DATE),  -- Today (word: "a încropi")
  ('indaratnic-15', CURRENT_DATE - INTERVAL '1 day'),  -- Yesterday (word: "îndărătnic")
  ('miji-12', CURRENT_DATE - INTERVAL '2 days')  -- Day before yesterday (word: "a miji")
ON CONFLICT (date) DO UPDATE
SET word_id = EXCLUDED.word_id,
    updated_at = timezone('utc'::text, now());

