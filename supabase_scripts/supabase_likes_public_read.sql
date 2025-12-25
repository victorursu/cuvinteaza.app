-- Allow public read access to likes for statistics
-- This enables community statistics (top liked words) to work

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own likes" ON public."cuvinteziLikes";

-- Create new policy that allows public read access (for statistics)
-- Users can still only insert/delete their own likes
CREATE POLICY "Anyone can view likes (for statistics)"
ON public."cuvinteziLikes"
FOR SELECT
USING (true);

-- Keep existing insert and delete policies (users can only modify their own likes)
-- These should already exist from supabase_setup.sql

