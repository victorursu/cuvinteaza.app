-- Create the cuvinteziTeste table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."cuvinteziTeste" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_profile_level TEXT CHECK (user_profile_level IN ('beginner', 'intermediate', 'advanced')),
  final_calculated_level TEXT CHECK (final_calculated_level IN ('beginner', 'intermediate', 'advanced')),
  points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  max_correct_answers INTEGER NOT NULL,
  easy_percentage NUMERIC(5, 2) NOT NULL,
  medium_percentage NUMERIC(5, 2) NOT NULL,
  hard_percentage NUMERIC(5, 2) NOT NULL,
  final_percentage NUMERIC(5, 2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziTeste" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own test results
CREATE POLICY "Users can view their own test results"
ON public."cuvinteziTeste"
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own test results
CREATE POLICY "Users can insert their own test results"
ON public."cuvinteziTeste"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Optional: Create an index for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziTeste_user_id_idx" ON public."cuvinteziTeste"(user_id);
CREATE INDEX IF NOT EXISTS "cuvinteziTeste_created_at_idx" ON public."cuvinteziTeste"(created_at);


