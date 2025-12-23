-- Create the cuvinteziLikes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."cuvinteziLikes" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  word_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, word_id)
);

-- Enable Row Level Security
ALTER TABLE public."cuvinteziLikes" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own likes
CREATE POLICY "Users can view their own likes"
ON public."cuvinteziLikes"
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own likes
CREATE POLICY "Users can insert their own likes"
ON public."cuvinteziLikes"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own likes
CREATE POLICY "Users can delete their own likes"
ON public."cuvinteziLikes"
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Create an index for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziLikes_user_id_idx" ON public."cuvinteziLikes"(user_id);
CREATE INDEX IF NOT EXISTS "cuvinteziLikes_word_id_idx" ON public."cuvinteziLikes"(word_id);

