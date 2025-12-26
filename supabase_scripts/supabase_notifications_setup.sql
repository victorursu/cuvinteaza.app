-- Create table to store push notification history
CREATE TABLE IF NOT EXISTS public."cuvinteziNotifications" (
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

-- Enable Row Level Security
ALTER TABLE public."cuvinteziNotifications" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public."cuvinteziNotifications"
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow inserts for notifications
-- This allows all inserts for anonymous and authenticated users (for the notification script)
-- When using service role key, RLS is bypassed entirely
-- When using anon key, this policy allows all inserts
-- This is safe because it's a logging table for notifications sent by the script
CREATE POLICY "Allow notification inserts"
ON public."cuvinteziNotifications"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "cuvinteziNotifications_user_id_idx" ON public."cuvinteziNotifications"(user_id);
CREATE INDEX IF NOT EXISTS "cuvinteziNotifications_word_id_idx" ON public."cuvinteziNotifications"(word_id);
CREATE INDEX IF NOT EXISTS "cuvinteziNotifications_sent_at_idx" ON public."cuvinteziNotifications"(sent_at);
CREATE INDEX IF NOT EXISTS "cuvinteziNotifications_token_idx" ON public."cuvinteziNotifications"(token);

-- Add comments
COMMENT ON TABLE public."cuvinteziNotifications" IS 'Stores history of push notifications sent to users';
COMMENT ON COLUMN public."cuvinteziNotifications".word_id IS 'Reference to the word that was sent in the notification';
COMMENT ON COLUMN public."cuvinteziNotifications".word_title IS 'Title of the word at the time of notification';
COMMENT ON COLUMN public."cuvinteziNotifications".token IS 'Expo push token that received the notification';
COMMENT ON COLUMN public."cuvinteziNotifications".user_id IS 'User who received the notification (if token is linked to a user)';
COMMENT ON COLUMN public."cuvinteziNotifications".sent_at IS 'Timestamp when the notification was sent';
COMMENT ON COLUMN public."cuvinteziNotifications".ticket_id IS 'Expo push notification ticket ID';

