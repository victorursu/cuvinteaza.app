-- Drop and recreate the notifications table with proper RLS policies
-- This script will completely recreate the table from scratch

-- Step 1: Drop the table (this will cascade delete any dependent objects)
DROP TABLE IF EXISTS public."cuvinteziNotifications" CASCADE;

-- Step 2: Create the table
CREATE TABLE public."cuvinteziNotifications" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  word_id BIGINT NOT NULL REFERENCES public."cuvinteziCuvinte"(id) ON DELETE CASCADE,
  word_title TEXT NOT NULL,
  token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notification_title TEXT,
  notification_body TEXT,
  ticket_id TEXT
);

-- Step 3: Enable Row Level Security
ALTER TABLE public."cuvinteziNotifications" ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public."cuvinteziNotifications"
FOR SELECT
USING (auth.uid() = user_id);

-- Step 5: Create policy to allow inserts for anonymous and authenticated users
-- This is needed for the notification script which runs unauthenticated
-- When using service role key, RLS is bypassed entirely
-- When using anon key, this policy allows all inserts
CREATE POLICY "Allow notification inserts"
ON public."cuvinteziNotifications"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 6: Create indexes for better query performance
CREATE INDEX "cuvinteziNotifications_user_id_idx" ON public."cuvinteziNotifications"(user_id);
CREATE INDEX "cuvinteziNotifications_word_id_idx" ON public."cuvinteziNotifications"(word_id);
CREATE INDEX "cuvinteziNotifications_sent_at_idx" ON public."cuvinteziNotifications"(sent_at);
CREATE INDEX "cuvinteziNotifications_token_idx" ON public."cuvinteziNotifications"(token);

-- Step 7: Add comments
COMMENT ON TABLE public."cuvinteziNotifications" IS 'Stores history of push notifications sent to users';
COMMENT ON COLUMN public."cuvinteziNotifications".word_id IS 'Reference to the word that was sent in the notification';
COMMENT ON COLUMN public."cuvinteziNotifications".word_title IS 'Title of the word at the time of notification';
COMMENT ON COLUMN public."cuvinteziNotifications".token IS 'Expo push token that received the notification';
COMMENT ON COLUMN public."cuvinteziNotifications".user_id IS 'User who received the notification (if token is linked to a user)';
COMMENT ON COLUMN public."cuvinteziNotifications".sent_at IS 'Timestamp when the notification was sent';
COMMENT ON COLUMN public."cuvinteziNotifications".ticket_id IS 'Expo push notification ticket ID';

