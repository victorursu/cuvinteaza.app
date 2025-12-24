# WordDetailScreen Usage Guide

## Overview

The `WordDetailScreen` component displays a single vocabulary word by its ID. It loads vocabulary data from either:
- The external vocabulary URL (`EXPO_PUBLIC_VOCABULARY_URL`)
- The fallback vocabulary file (`fallbackVocabulary.ro.json`)

## How to Use

### 1. Import the Component

```typescript
import { WordDetailScreen } from "./src/screens/WordDetailScreen";
```

### 2. Use in Your App

Since your app uses a simple tab-based navigation (not React Navigation), you have a few options:

#### Option A: Add to App.tsx as a new screen mode

Modify `App.tsx` to support a "word" mode:

```typescript
// In App.tsx
const [wordId, setWordId] = useState<string | null>(null);

const screen = useMemo(() => {
  if (wordId) {
    return <WordDetailScreen wordId={wordId} />;
  }
  
  switch (tab) {
    // ... existing cases
  }
}, [tab, wordId]);
```

#### Option B: Use it directly in a component

```typescript
// In any component
import { WordDetailScreen } from "./src/screens/WordDetailScreen";

function MyComponent() {
  const wordId = "some-word-id";
  return <WordDetailScreen wordId={wordId} />;
}
```

#### Option C: Add navigation state to App.tsx

```typescript
// In App.tsx
type NavigationState = 
  | { type: "tabs"; tab: TabKey }
  | { type: "word"; wordId: string };

const [nav, setNav] = useState<NavigationState>({ type: "tabs", tab: "cuvinte" });

const screen = useMemo(() => {
  if (nav.type === "word") {
    return <WordDetailScreen wordId={nav.wordId} />;
  }
  
  switch (nav.tab) {
    // ... existing cases
  }
}, [nav]);
```

## Word ID Format

Word IDs can come from:
1. **External vocabulary URL**: If the JSON includes an `id` field for each word
2. **Fallback vocabulary**: IDs are auto-generated from the word title using `slugifyId(title)` + index

The ID format is typically: `slugified-title-1`, `slugified-title-2`, etc.

Example IDs:
- `a-miji-1`
- `cuvant-complex-5`
- `custom-id` (if provided in the JSON)

## Example: Navigating to a Word

```typescript
// From VocabularyScreen or any other component
function navigateToWord(wordId: string) {
  // Set the word ID in your app state
  setWordId(wordId);
  // Or use your navigation state
  setNav({ type: "word", wordId });
}
```

## Features

- ✅ Loads from external URL or fallback JSON
- ✅ Displays full word card with image, definition, examples, tags
- ✅ Includes like/heart functionality
- ✅ Handles loading and error states
- ✅ Shows "word not found" if ID doesn't exist

## Props

```typescript
<WordDetailScreen wordId: string />
```

- `wordId`: The unique identifier of the word to display


