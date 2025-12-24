-- Update notification_timeframe constraint and migrate existing data
-- Run this if you've already created the table and need to update the values

-- First, update existing data
UPDATE public."cuvinteziProfile"
SET notification_timeframe = CASE
  WHEN notification_timeframe = '12-4' THEN '12-16'
  WHEN notification_timeframe = '4-8' THEN '16-20'
  ELSE notification_timeframe
END
WHERE notification_timeframe IN ('12-4', '4-8');

-- Drop the old constraint
ALTER TABLE public."cuvinteziProfile"
DROP CONSTRAINT IF EXISTS cuvinteziProfile_notification_timeframe_check;

-- Add the new constraint with updated values
ALTER TABLE public."cuvinteziProfile"
ADD CONSTRAINT cuvinteziProfile_notification_timeframe_check
CHECK (notification_timeframe IN ('7-10', '12-16', '16-20'));


