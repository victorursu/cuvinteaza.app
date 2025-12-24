-- Update existing RLS policies to allow tokens with null user_id
-- Run this if you've already created the table and need to update the policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own push tokens" ON "cuvinteziPushTokens";
DROP POLICY IF EXISTS "Users can insert their own push tokens" ON "cuvinteziPushTokens";
DROP POLICY IF EXISTS "Users can update their own push tokens" ON "cuvinteziPushTokens";

-- Recreate policies with null user_id support
CREATE POLICY "Users can view their own push tokens" ON "cuvinteziPushTokens"
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own push tokens" ON "cuvinteziPushTokens"
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own push tokens" ON "cuvinteziPushTokens"
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

