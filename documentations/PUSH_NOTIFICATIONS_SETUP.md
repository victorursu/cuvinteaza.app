# Push Notifications Setup Guide

## Overview

This guide explains how to set up push notifications that can deep link to the WordDetailScreen with a specific word ID.

## Installation

1. Install expo-notifications:
```bash
npm install expo-notifications
```

2. Update `app.json` to include notification configuration (already done in the code)

## How It Works

### 1. Notification Format

When sending a push notification, include the word ID in the notification data:

```json
{
  "title": "Cuvântul zilei",
  "body": "Învață cuvântul: a se furișa",
  "data": {
    "type": "word",
    "wordId": "a-se-furisa-1"
  }
}
```

### 2. Deep Link Format

The app uses the scheme `cuvinteaza.app://` for deep links. You can also use:
- `cuvinteaza.app://word/a-se-furisa-1`
- Or include the wordId in notification data (recommended)

### 3. Sending Notifications

#### Option A: Using the Helper Script
```bash
node scripts/send-notification.js ExponentPushToken[xxxxx] a-se-furisa-1 "Cuvântul zilei" "Învață cuvântul: a se furișa"
```

Or with default title/body:
```bash
node scripts/send-notification.js ExponentPushToken[xxxxx] a-se-furisa-1
```

#### Option B: Using Expo Push Notification API
```bash
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxx]",
    "title": "Cuvântul zilei",
    "body": "Învață cuvântul: a se furișa",
    "data": {
      "type": "word",
      "wordId": "a-se-furisa-1"
    }
  }'
```

#### Option C: Using Supabase Edge Functions or External Service
You can create a backend service that sends notifications based on user preferences stored in the `cuvinteziProfile` table.

## Notification Handling

The app automatically:
1. Registers for push notifications on app start
2. Handles notification taps to navigate to WordDetailScreen
3. Handles deep links when the app is opened via URL

## Testing

### Testing in Browser

1. Open `public/test-notification.html` in your browser
2. Enter a word ID and click "Test Deep Link" or "Simulate Notification Tap"
3. Note: Deep links only work if the app is installed/running

### Testing Push Notifications (Native Only)

**Push notifications only work on native platforms (iOS/Android), not in web browsers.**

1. Run the app on a physical device or emulator:
   ```bash
   npx expo start
   # Then press 'i' for iOS or 'a' for Android
   ```

2. Get your Expo Push Token from the app console logs

3. Send a test notification using one of the methods above:
   ```bash
   node scripts/send-notification.js ExponentPushToken[xxxxx] a-se-furisa-1
   ```

4. Tap the notification to verify it opens the word detail screen

### Testing Deep Links

You can test deep links directly:
- **iOS Simulator**: `xcrun simctl openurl booted "cuvinteaza.app://word/a-se-furisa-1"`
- **Android Emulator**: `adb shell am start -W -a android.intent.action.VIEW -d "cuvinteaza.app://word/a-se-furisa-1"`
- **Physical Device**: Open the URL in a browser or use a QR code

## User Preferences

Users can set their notification preferences in the Account screen:
- Vocabulary level
- Age
- Notification timeframe (7-10, 12-4, 4-8)

These preferences can be used to determine which words to send in notifications.

