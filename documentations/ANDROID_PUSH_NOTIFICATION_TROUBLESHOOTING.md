# Android Push Notification Troubleshooting

## Error: "Nu s-a putut obține token-ul de notificare"

This error occurs when the app cannot get an Expo Push Token on Android. Here are the most common causes and solutions:

## ✅ Requirements for Push Notifications on Android

1. **App must be built with EAS Build**
   - Local builds (`expo build` or `npx expo run:android`) won't work for push notifications
   - You MUST use `eas build --platform android` to build your APK
   - EAS Build automatically configures Firebase Cloud Messaging (FCM) for you

2. **Google Play Services must be installed and updated**
   - Push notifications require Google Play Services
   - Check: Settings → Apps → Google Play Services → Update if needed
   - Some devices (like Chinese phones without Google services) won't support push notifications

3. **Internet connection required**
   - The device needs internet to register for push notifications

4. **Notification permissions must be granted**
   - The app will prompt for this, but check: Settings → Apps → Your App → Notifications

## 🔍 How to Verify Your Build

### Check if built with EAS Build:
1. The APK should be downloaded from `expo.dev` or EAS Build dashboard
2. Check the build logs in EAS Build dashboard
3. Local builds won't have FCM configured

### Verify Google Play Services:
1. Open Google Play Store
2. Search for "Google Play Services"
3. Make sure it's installed and up to date

## 🛠️ Solutions

### Solution 1: Rebuild with EAS Build
```bash
# Make sure you're logged in
eas login

# Build for Android
eas build --platform android --profile preview
```

### Solution 2: Check Device Compatibility
- Some devices (especially Chinese phones) don't have Google Play Services
- These devices cannot receive push notifications
- Test on a different device if possible

### Solution 3: Check Network Connection
- Ensure the device has internet access
- Try on WiFi and mobile data
- Check if firewall is blocking connections

### Solution 4: Check Error Details
The improved error handling will now show:
- Specific error messages
- Whether it's a Google Play Services issue
- Whether it's a network issue
- Detailed troubleshooting steps

## 📱 Testing

1. **Build with EAS Build:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Install the APK** on your Android device

3. **Open the app** and go to Account → Edit Profile

4. **Toggle "Permite notificări"** ON

5. **Check the error message** - it will now provide specific guidance

6. **Check logs** (if you have adb):
   ```bash
   adb logcat | grep -E "(Push|Token|Expo|Notification)"
   ```

## 🔑 Important Notes

- **Expo Go app won't work** - You need a standalone build
- **Local development builds won't work** - Must use EAS Build
- **Google Play Services is required** - No workaround for this
- **The error message will now be more helpful** - Check what it says!

## 📞 Still Having Issues?

1. Check the console logs for detailed error information
2. Verify the build was done with EAS Build (not local)
3. Test on a device with Google Play Services
4. Check the error message in the alert - it now provides specific guidance


