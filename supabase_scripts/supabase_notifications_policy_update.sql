-- Update the notification insert policy to allow inserts with any user_id
-- This is needed because the script runs unauthenticated and may have a user_id
-- Run this if you've already created the table and need to update the policy

-- Drop ALL existing insert policies (in case there are multiple)
DROP POLICY IF EXISTS "Allow notification inserts" ON public."cuvinteziNotifications";
DROP POLICY IF EXISTS "Service role can insert notifications" ON public."cuvinteziNotifications";
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public."cuvinteziNotifications";

-- Create new policy that allows inserts for anonymous users (unauthenticated script)
-- This works with the anon key when there's no authenticated user
-- When using service role key, RLS is bypassed entirely
-- Note: This is safe because it's a logging table for notifications sent by the script
CREATE POLICY "Allow notification inserts"
ON public."cuvinteziNotifications"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

