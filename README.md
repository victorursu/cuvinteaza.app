# cuvinteaza.app (Expo)

An Expo (React Native) app that loads a Romanian vocabulary list from an external JSON endpoint and displays it.

## Start the app

Install deps (already done if you ran `create-expo-app`):

```bash
npm install
```

Run the dev server:

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator (macOS + Xcode required)
- Press `a` for Android emulator (Android Studio required)
- Press `w` for web
- Or scan the QR code with **Expo Go** on your phone

You can also use:

```bash
npm run ios
npm run android
npm run web
```

## Configure the vocabulary JSON URL

The app reads:

- `EXPO_PUBLIC_VOCABULARY_URL`

### Option A: `.env` file (recommended)

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_VOCABULARY_URL=https://your-domain.com/vocabulary.ro.json
```

Restart the dev server after changing env vars.

### Option B: set it inline for one run

```bash
EXPO_PUBLIC_VOCABULARY_URL="https://your-domain.com/vocabulary.ro.json" npx expo start
```

## Vocabulary JSON format

The app accepts either:

### 1) Top-level array

```json
[
  { "title": "...", "definition": "...", "image": "https://...", "tags": ["..."] }
]
```

### 2) Wrapped object

```json
{
  "words": [
    { "title": "...", "definition": "...", "image": "https://...", "tags": ["..."] }
  ]
}
```

## Mock data

The app includes a bundled fallback vocabulary for offline / remote failures:

- `src/data/fallbackVocabulary.ro.json`


