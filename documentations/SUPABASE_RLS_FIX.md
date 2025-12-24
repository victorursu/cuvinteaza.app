# Fixing RLS Policy Violation for Push Tokens

## The Problem

You're seeing this error:
```
"new row violates row-level security policy (USING expression) for table \"cuvinteziPushTokens\""
```

This happens when trying to save push tokens to Supabase, especially when the user is not logged in.

## Solution: Update RLS Policies in Supabase

The RLS policies need to allow tokens to be saved even when `user_id` is `NULL` (for users who aren't logged in yet).

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)

### Step 2: Run the RLS Policy Update Script

Copy and paste this SQL script into the SQL Editor and run it:

```sql
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
```

### Step 3: Verify Policies Are Applied

After running the script, verify the policies:

1. Go to **Authentication** → **Policies** (or **Table Editor** → `cuvinteziPushTokens` → **Policies**)
2. You should see three policies for `cuvinteziPushTokens`:
   - "Users can view their own push tokens"
   - "Users can insert their own push tokens"
   - "Users can update their own push tokens"

### Step 4: Test

1. Reload your app in Expo Go
2. Try toggling notifications ON
3. The error should be gone! ✅

## What These Policies Do

- **SELECT**: Users can view their own tokens OR tokens with `user_id IS NULL`
- **INSERT**: Users can insert tokens with their own `user_id` OR with `user_id IS NULL`
- **UPDATE**: Users can update tokens with their own `user_id` OR with `user_id IS NULL`

This allows:
- Saving tokens before user logs in (`user_id IS NULL`)
- Saving tokens after user logs in (`user_id = auth.uid()`)
- Updating tokens when user logs in/out

## Alternative: If You Haven't Created the Table Yet

If you need to create the table from scratch, use the script in:
`supabase_scripts/supabase_push_tokens_setup.sql`

Then run the policy update script above.

## Troubleshooting

### Still getting RLS errors?

1. **Check if policies exist**: Go to Supabase Dashboard → Table Editor → `cuvinteziPushTokens` → Policies
2. **Check policy conditions**: Make sure they include `OR user_id IS NULL`
3. **Check RLS is enabled**: The table should have RLS enabled (it should be by default)

### Error persists after updating policies?

1. Make sure you ran the SQL script in the correct Supabase project
2. Check that the table name is exactly `cuvinteziPushTokens` (case-sensitive)
3. Try refreshing your app or restarting Expo

