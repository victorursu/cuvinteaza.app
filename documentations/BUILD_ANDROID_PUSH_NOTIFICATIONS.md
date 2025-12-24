# Building Android App for Push Notifications

## Why Expo Go Doesn't Work

Expo Go doesn't support Android push notifications in SDK 53+. You need to build a standalone app using EAS Build.

## Quick Start: Build and Test Push Notifications

### Step 1: Build a Development Build (Recommended for Testing)

```bash
# Make sure you're logged in to EAS
eas login

# Build a development build for Android
eas build --profile development --platform android
```

This will:
- Build an APK with push notification support
- Include the `expo-notifications` plugin properly configured
- Set up Firebase Cloud Messaging (FCM) automatically
- Allow you to test push notifications

### Step 2: Install the Build

1. Wait for the build to complete (check `https://expo.dev`)
2. Download the APK from the EAS Build dashboard
3. Install it on your Android device:
   ```bash
   # Option A: Download from EAS dashboard and install manually
   # Option B: Use adb if device is connected
   adb install path/to/your-app.apk
   ```

### Step 3: Test Push Notifications

1. Open the app on your Android device
2. Go to **Account** → **Edit Profile**
3. Toggle **"Allow notifications"** ON
4. Grant notification permissions when prompted
5. The push token should appear in the text box
6. Check Supabase `cuvinteziPushTokens` table - you should see the token!

### Alternative: Build Preview/Production Build

If you prefer a production-like build:

```bash
# Preview build (for internal testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
```

## What Happens After Building

✅ **Development/Preview/Production builds**:
- Push notifications work
- Tokens are generated automatically
- Tokens are saved to Supabase
- You can send notifications using the token

❌ **Expo Go**:
- Push notifications don't work
- Shows helpful error message
- No token generation

## Verify Your Build

After installing the build, check:

1. **Token appears in Account screen** - Should show `ExponentPushToken[...]`
2. **Token in Supabase** - Check `cuvinteziPushTokens` table
3. **Send a test notification**:
   ```bash
   npx expo-notifications send \
     --to ExponentPushToken[YOUR_TOKEN] \
     --title "Test" \
     --body "This is a test notification"
   ```

## Troubleshooting

### Token Not Appearing

1. **Check permissions**: Settings → Apps → Your App → Notifications (should be enabled)
2. **Check internet**: Device needs internet to register for push notifications
3. **Check Google Play Services**: Some devices without Google services won't work
4. **Check console logs**: Look for error messages in the app logs

### Build Fails

1. Make sure you're logged in: `eas login`
2. Check your `app.json` has the `expo-notifications` plugin configured (✅ already done)
3. Check your EAS project ID matches: `aa40ced7-dddf-43c9-99d2-3fdf3a48820c`

## Next Steps

Once you have a working build:
1. Test sending notifications using the script in `scripts/send-notification.js`
2. Set up a backend service to send notifications automatically
3. Configure notification scheduling based on user preferences

