# How to Check if Push Token Was Saved

Since you're using a production .apk, here's how to verify if the push token was saved to Supabase:

## Option 1: Check Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → `cuvinteziPushTokens`
3. Check if there are any rows in the table
4. If you see a row with your token, it was saved successfully!

## Option 2: Check Android Logs (if you have adb)

If you have Android SDK Platform Tools installed:

```bash
# Connect your Android device via USB and enable USB debugging
adb logcat | grep -E "(Push|Token|Supabase|💾|✅|❌)"
```

This will show all push token related logs.

## Option 3: Check Supabase Logs

1. Go to your Supabase project dashboard
2. Navigate to **Logs** → **API Logs**
3. Look for any errors related to `cuvinteziPushTokens` table
4. Check for 403 (Forbidden) or 42501 (RLS policy violation) errors

## Common Issues

### Issue 1: RLS Policies Not Set Up
If you see a 403 or 42501 error, the RLS policies might not be configured correctly.

**Solution:** Run these SQL scripts in Supabase SQL Editor:
1. `supabase_push_tokens_setup.sql` - Creates the table and initial policies
2. `supabase_push_tokens_policy_update.sql` - Updates policies to allow `user_id IS NULL`

### Issue 2: Token Not Generated
The token might not be generated if:
- Notification permissions are not granted
- The app is running in a restricted environment

**Solution:** Check if notification permissions are granted in Android Settings → Apps → Your App → Notifications

### Issue 3: Network/Connection Issue
The app might not be able to connect to Supabase.

**Solution:** 
- Check if `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set correctly in your EAS build
- Verify the Supabase URL is accessible from your device

## Quick Test

To test if the token saving works:

1. Open the app on your Android device
2. Wait a few seconds for the app to initialize
3. Check Supabase dashboard for new rows in `cuvinteziPushTokens` table
4. If no row appears, check Supabase API logs for errors

## Manual Verification Query

Run this in Supabase SQL Editor to check all tokens:

```sql
SELECT 
  id,
  user_id,
  LEFT(token, 30) || '...' as token_preview,
  device_info,
  created_at,
  updated_at
FROM "cuvinteziPushTokens"
ORDER BY created_at DESC
LIMIT 10;
```


