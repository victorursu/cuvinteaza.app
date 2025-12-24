-- Fix notification_timeframe constraint to allow NULL values
-- First, we need to update any existing rows that might have invalid values

-- Step 1: Temporarily disable the constraint so we can update invalid rows
ALTER TABLE public."cuvinteziProfile" 
DROP CONSTRAINT IF EXISTS "cuvinteziProfile_notification_timeframe_check";

-- Step 2: Update any invalid notification_timeframe values to NULL
-- This includes empty strings, invalid values, or anything not in the allowed list
UPDATE public."cuvinteziProfile"
SET notification_timeframe = NULL
WHERE notification_timeframe IS NULL 
   OR notification_timeframe NOT IN ('7-10', '12-16', '16-20')
   OR notification_timeframe = '';

-- Step 3: Recreate the constraint to allow NULL values
ALTER TABLE public."cuvinteziProfile"
ADD CONSTRAINT "cuvinteziProfile_notification_timeframe_check" 
CHECK (notification_timeframe IS NULL OR notification_timeframe IN ('7-10', '12-16', '16-20'));
