# Firebase Setup - Alternative Method (Direct File Upload)

Since the Expo Dashboard might not show the `google-services.json` upload option, here's an alternative method that works reliably.

## Step 1: Get google-services.json from Firebase

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your project (or create one if needed)
3. Click the **Android icon** to add an Android app
4. Enter package name: `ro.cuvintezi.app`
5. Click **"Register app"**
6. **Download `google-services.json`** - save it to your Desktop or Downloads

## Step 2: Add google-services.json to Your Project

1. **Copy the file to your project root**:
   - The file should be at the same level as `package.json` and `app.json`
   - Path should be: `/Users/victor/projects/personal/cuvinteaza.app/google-services.json`

2. **Update `app.json`** to reference the file:

Add this to your `android` section in `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "ro.cuvintezi.app",
      "googleServicesFile": "./google-services.json",
      // ... rest of your android config
    }
  }
}
```

## Step 3: Verify the File is in Your Project

Run this command to check:

```bash
ls -la google-services.json
```

You should see the file listed.

## Step 4: Rebuild Your App

After adding the file and updating `app.json`, rebuild:

```bash
eas build --profile preview --platform android
```

## Step 5: Test

1. Install the new build
2. Open app → Account → Edit Profile
3. Toggle "Allow notifications" ON
4. Should work! ✅

---

## Important Notes

- The `google-services.json` file must be in the project root (same folder as `app.json`)
- The package name in Firebase must match exactly: `ro.cuvintezi.app`
- You must rebuild after adding the file
- Make sure `.gitignore` doesn't exclude `google-services.json` (it's okay to commit it)

