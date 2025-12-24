# Firebase Setup for Expo - Step by Step Guide

## Overview
This guide will walk you through setting up Firebase Cloud Messaging (FCM) for your Expo Android app to enable push notifications.

---

## Part 1: Create Firebase Project

### Step 1: Go to Firebase Console
1. Open your browser and go to: **https://console.firebase.google.com/**
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. If you don't have a project:
   - Click **"Add project"** or **"Create a project"**
   - Enter a project name (e.g., "Cuvintezi App")
   - Click **"Continue"**
   - (Optional) Enable Google Analytics - you can skip this
   - Click **"Create project"**
   - Wait for project creation to complete
   - Click **"Continue"**

2. If you already have a project:
   - Select it from the project list

### Step 3: Add Android App to Firebase
1. In your Firebase project dashboard, look for the **Android icon** (or click **"Add app"** → **Android**)
2. You'll see a form asking for:
   - **Android package name**: Enter exactly: `ro.cuvintezi.app`
   - **App nickname** (optional): "Cuvintezi" or leave blank
   - **Debug signing certificate SHA-1** (optional): Leave blank for now
3. Click **"Register app"**
4. **IMPORTANT**: Download the `google-services.json` file
   - Click the **"Download google-services.json"** button
   - Save this file somewhere you can find it (like your Desktop or Downloads folder)
   - **DO NOT** put it in your project folder yet - we'll upload it to Expo directly
5. Click **"Next"** (you can skip the remaining steps for now)

---

## Part 2: Upload Credentials to Expo

### Step 4: Go to Expo Dashboard
1. Open: **https://expo.dev/accounts/ursuvictor/projects/cuvintezi**
2. Sign in if needed

### Step 5: Navigate to Credentials
1. In the left sidebar, look for **"Credentials"** or **"Build credentials"**
2. Click on it
3. You should see tabs for **"iOS"** and **"Android"**
4. Click on the **"Android"** tab

### Step 6: Add FCM Credentials
1. Look for a section called **"FCM (Firebase Cloud Messaging)"** or **"Push Notifications"**
2. You should see one of these options:
   - **"Add FCM Credentials"** button
   - **"Configure FCM"** button
   - **"Upload google-services.json"** button
   - Or a section that says **"No FCM credentials configured"** with an **"Add"** or **"Configure"** link

3. Click the button/link to add FCM credentials

4. You'll be prompted to:
   - **Upload `google-services.json`**: Click "Choose file" or "Upload" and select the `google-services.json` file you downloaded from Firebase
   - **FCM Server Key** (optional): You can skip this - it's not needed for receiving notifications

5. Click **"Save"** or **"Submit"**

### Step 7: Verify Credentials Are Saved
1. After uploading, you should see:
   - The `google-services.json` file listed
   - A green checkmark or "Configured" status
   - The Firebase project ID displayed

---

## Part 3: Alternative Method - Using EAS CLI

If you can't find the option in the dashboard, use the CLI:

### Step 8: Use EAS CLI to Upload Credentials
1. Open your terminal
2. Make sure you're in your project directory
3. Run:
   ```bash
   eas credentials
   ```
4. You'll see a menu - select:
   - **"Android"** (type the number or arrow keys)
5. Then select:
   - **"Set up FCM credentials"** or **"Push Notifications"**
6. When prompted:
   - **"Upload google-services.json"**: Select the file you downloaded
   - **"FCM Server Key"**: Press Enter to skip (it's optional)
7. The credentials will be uploaded

---

## Part 4: Rebuild Your App

### Step 9: Rebuild with New Credentials
After uploading credentials, you **MUST** rebuild your app:

```bash
eas build --profile preview --platform android
```

**Important Notes:**
- The credentials are baked into the app during build time
- Old builds won't have the Firebase credentials
- You need a fresh build after adding credentials

### Step 10: Install and Test
1. Wait for the build to complete
2. Download and install the new APK on your device
3. Open the app
4. Go to **Account** → **Edit Profile**
5. Toggle **"Allow notifications"** ON
6. The push token should now be generated successfully! ✅

---

## Troubleshooting

### Can't find "Credentials" in Expo Dashboard?
- Try: **https://expo.dev/accounts/ursuvictor/projects/cuvintezi/credentials**
- Or: **https://expo.dev/accounts/ursuvictor/projects/cuvintezi/settings/credentials**

### Still getting Firebase initialization error after rebuild?
1. **Double-check the package name**: Must be exactly `ro.cuvintezi.app` (no spaces, correct case)
2. **Verify credentials are saved**: Check Expo Dashboard → Credentials → Android
3. **Make sure you rebuilt**: Old builds don't have the credentials
4. **Check build logs**: Look for any FCM-related errors during the build

### Need to verify credentials are uploaded?
Run:
```bash
eas credentials --platform android
```
This will show you the current credential status.

---

## Quick Checklist

- [ ] Created Firebase project
- [ ] Added Android app with package name `ro.cuvintezi.app`
- [ ] Downloaded `google-services.json` file
- [ ] Uploaded `google-services.json` to Expo Dashboard
- [ ] Rebuilt the app with `eas build`
- [ ] Installed the new build on device
- [ ] Tested notification toggle

---

## Support Links

- **Firebase Console**: https://console.firebase.google.com/
- **Expo Dashboard**: https://expo.dev/accounts/ursuvictor/projects/cuvintezi
- **Expo FCM Docs**: https://docs.expo.dev/push-notifications/fcm-credentials/
- **Your Project ID**: `aa40ced7-dddf-43c9-99d2-3fdf3a48820c`

