-- Add notifications_enabled field to existing cuvinteziProfile table
-- Run this if you've already created the table and need to add the notifications_enabled field

-- Add the column if it doesn't exist
ALTER TABLE public."cuvinteziProfile"
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT false;

-- Update existing rows to have notifications_enabled = false by default
UPDATE public."cuvinteziProfile"
SET notifications_enabled = false
WHERE notifications_enabled IS NULL;


