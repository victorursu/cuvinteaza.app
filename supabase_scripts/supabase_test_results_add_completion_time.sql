-- Add completion_time_seconds column to cuvinteziTeste table
-- This column stores the time (in seconds) it took the user to complete the test

ALTER TABLE public."cuvinteziTeste"
ADD COLUMN IF NOT EXISTS completion_time_seconds INTEGER;

-- Add a comment to document the column
COMMENT ON COLUMN public."cuvinteziTeste".completion_time_seconds IS 'Time taken to complete the test in seconds';

