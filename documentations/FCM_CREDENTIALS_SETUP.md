# Firebase Cloud Messaging (FCM) Credentials Setup

## The Problem

You're seeing this error:
```
Default FirebaseApp is not initialized in this process ro.cuvintezi.app. 
Make sure to call FirebaseApp.initializeApp(Context) first.
```

This means Firebase Cloud Messaging (FCM) credentials haven't been configured for your Expo project.

## Solution: Add FCM Credentials to Expo

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard (you can skip Google Analytics if you want)

### Step 2: Add Android App to Firebase

1. In your Firebase project, click the **Android icon** (or "Add app")
2. Enter your Android package name: `ro.cuvintezi.app`
3. Register the app
4. **Download the `google-services.json` file** (you'll need this)

### Step 3: Enable Cloud Messaging API

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on the **"Cloud Messaging"** tab
3. **Note:** The legacy API is deprecated. For Expo, you mainly need the `google-services.json` file
4. If you see options to enable APIs, make sure **"Cloud Messaging API"** is enabled
5. For sending notifications from a backend, you'll need to set up FCM v1 API (see "Sending Notifications" section below)

### Step 4: Add Credentials to Expo

**Important:** For receiving push notifications in your app, you mainly need the `google-services.json` file. The FCM Server Key is optional and mainly used for sending notifications from a backend.

#### Option A: Using Expo Dashboard (Recommended)

1. Go to [Expo Dashboard](https://expo.dev/accounts/ursuvictor/projects/cuvintezi)
2. Navigate to **Credentials** → **Android**
3. Click **"Add FCM Credentials"** or **"Configure FCM"**
4. Upload the `google-services.json` file you downloaded
5. If prompted for a Server Key, you can skip it for now (it's mainly for sending notifications)
6. Save the credentials

#### Option B: Using EAS CLI

```bash
# Upload google-services.json
eas credentials

# Select your project
# Choose "Android"
# Select "Set up FCM credentials"
# Upload google-services.json file
# You can skip the Server Key prompt if it appears
```

### Step 5: Rebuild Your App

After adding FCM credentials, you **must rebuild** your app:

```bash
eas build --profile preview --platform android
```

**Important:** The FCM credentials are baked into the app during the build process, so you need a new build after adding credentials.

## Verification

After rebuilding and installing:

1. Open the app
2. Go to **Account** → **Edit Profile**
3. Toggle **"Allow notifications"** ON
4. The push token should now be generated successfully! ✅

## Troubleshooting

### Still getting the error after adding credentials?

1. **Make sure you rebuilt** - Old builds won't have the credentials
2. **Check the package name** - Must match exactly: `ro.cuvintezi.app`
3. **Verify credentials in Expo Dashboard** - Make sure they're saved correctly
4. **Check build logs** - Look for any FCM-related errors during build

### FCM Server Key Not Available?

**Good news:** For receiving push notifications in your app, you don't actually need the FCM Server Key! The `google-services.json` file is sufficient.

The FCM Server Key is only needed if you want to send notifications from your own backend server. If you're using Expo's push notification service (which you are), Expo handles the sending for you.

**If you do need to send notifications from your backend:**
1. You'll need to use the new FCM v1 API (the legacy API is deprecated)
2. Set up a service account in Google Cloud Console
3. Generate a private key for the service account
4. Use that key with the FCM v1 API endpoints

For now, just upload the `google-services.json` file to Expo and rebuild - that's all you need!

## Quick Reference

- **Firebase Console**: https://console.firebase.google.com/
- **Expo Dashboard**: https://expo.dev/accounts/ursuvictor/projects/cuvintezi
- **FCM Setup Guide**: https://docs.expo.dev/push-notifications/fcm-credentials/
- **Package Name**: `ro.cuvintezi.app`
- **Project ID**: `aa40ced7-dddf-43c9-99d2-3fdf3a48820c`

