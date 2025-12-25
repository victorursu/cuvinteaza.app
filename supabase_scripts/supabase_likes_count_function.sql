-- Create a database function to count likes per word
-- This function bypasses RLS issues by running with SECURITY DEFINER
-- and ensures we get accurate counts for all users

CREATE OR REPLACE FUNCTION public.get_top_liked_words(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  word_id TEXT,
  like_count BIGINT,
  rank_number INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.word_id,
    COUNT(*)::BIGINT as like_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC)::INTEGER as rank_number
  FROM public."cuvinteziLikes" l
  GROUP BY l.word_id
  ORDER BY like_count DESC
  LIMIT limit_count;
END;
$$;

-- Create a function to count total distinct users from likes table
CREATE OR REPLACE FUNCTION public.get_total_users_from_likes()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)::BIGINT
    FROM public."cuvinteziLikes"
  );
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_top_liked_words(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_liked_words(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_total_users_from_likes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_users_from_likes() TO anon;

