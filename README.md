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
 - `EXPO_PUBLIC_TEST_URL`
 - `EXPO_PUBLIC_TEST_COUNT` (defaults to 30)
 - `EXPO_PUBLIC_TEST_REVEAL_MS` (defaults to 2000)
 - `EXPO_PUBLIC_REGIONALISME_URL`
 - `EXPO_PUBLIC_URBANISME_URL`

### Option A: `.env` file (recommended)

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_VOCABULARY_URL=https://your-domain.com/vocabulary.ro.json
EXPO_PUBLIC_TEST_URL=https://your-domain.com/test.ro.json
EXPO_PUBLIC_TEST_COUNT=30
EXPO_PUBLIC_TEST_REVEAL_MS=2000
EXPO_PUBLIC_REGIONALISME_URL=https://your-domain.com/regionalisme.ro.json
EXPO_PUBLIC_URBANISME_URL=https://your-domain.com/urbanisme.ro.json
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

## Testare (skill assessment) rules (30 questions)

The assessment uses **all three difficulty levels in a single run** to avoid misclassification.

### Test structure

Total: **30 questions**

- **10 × Easy**
- **10 × Medium**
- **10 × Hard**

### Weighted scoring

Each correct answer awards points based on difficulty:

- **Easy**: 1 point
- **Medium**: 2 points
- **Hard**: 3 points

Max score for 30 questions:

- Easy: \(10 × 1 = 10\)
- Medium: \(10 × 2 = 20\)
- Hard: \(10 × 3 = 30\)
- **Total max = 60 points**

### Minimum competency gates (tier caps)

Before assigning a level, minimum accuracy requirements apply:

- **Easy gate (Beginner+)**: Easy accuracy **≥ 70%**
- **Medium gate (Medium+)**: Medium accuracy **≥ 50%**
- **Hard gate (Expert)**: Hard accuracy **≥ 40%**

If a gate is not met, the user **cannot** be assigned above that tier.

### Final classification

- **Beginner**
  - Easy accuracy **≥ 70%**
  - AND (Medium accuracy **< 50%** **OR** Total score **< 25**)

- **Intermediate**
  - Easy accuracy **≥ 80%**
  - AND Medium accuracy **≥ 50%**
  - AND Hard accuracy **< 40%**
  - AND Total score **25–45**

- **Expert**
  - Easy accuracy **≥ 90%**
  - AND Medium accuracy **≥ 70%**
  - AND Hard accuracy **≥ 40%**
  - AND Total score **≥ 46**

## Mock data

The app includes a bundled fallback vocabulary for offline / remote failures:

- `src/data/fallbackVocabulary.ro.json`


