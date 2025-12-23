-- Create the cuvinteziProfile table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."cuvinteziProfile" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_level TEXT CHECK (vocabulary_level IN ('beginner', 'intermediate', 'advanced')),
  age INTEGER CHECK (age >= 4 AND age <= 120),
  notification_timeframe TEXT CHECK (notification_timeframe IN ('7-10', '12-4', '4-8')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziProfile" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON public."cuvinteziProfile"
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own profile
CREATE POLICY "Users can insert their own profile"
ON public."cuvinteziProfile"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public."cuvinteziProfile"
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cuvinteziProfile_updated_at
  BEFORE UPDATE ON public."cuvinteziProfile"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create an index for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziProfile_user_id_idx" ON public."cuvinteziProfile"(user_id);

