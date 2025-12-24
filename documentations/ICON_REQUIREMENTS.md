# Icon & Image Requirements for Expo App

## Overview
This document outlines the size requirements and usage for all icon and image assets used in the Cuvintezi app.

---

## 1. `icon.png` - Main App Icon

**Size:** `1024 x 1024 pixels`
**Format:** PNG
**Usage:**
- Main app icon for iOS and Android
- Used in app stores (App Store, Google Play)
- Used for push notification icon (configured in `app.json`)
- Displayed on home screens

**Requirements:**
- Square format (1:1 aspect ratio)
- No transparency (use solid background)
- No rounded corners (OS will apply masks)
- High quality, sharp edges
- Should work well at small sizes (down to 20x20px)

**Current Status:** ✅ 1024 x 1024 (8-bit colormap)

---

## 2. `adaptive-icon.png` - Android Adaptive Icon

**Size:** `1024 x 1024 pixels`
**Format:** PNG
**Usage:**
- Android adaptive icon (Android 8.0+)
- Foreground layer of the adaptive icon
- Displayed on Android home screens with various shapes (circle, square, rounded square, etc.)

**Requirements:**
- Square format (1024 x 1024)
- **Safe Zone:** Keep important content within the center 66% (about 676 x 676 pixels)
- Outer 33% may be cropped on some devices
- Can have transparency (transparent areas will show the background color)
- Background color is set in `app.json`: `#ffffff` (white)

**Current Status:** ✅ 1024 x 1024 (8-bit colormap)

**Design Tips:**
- Center your logo/icon in the middle 66% of the canvas
- Avoid placing text or important elements near the edges
- Test how it looks when cropped to circle, square, and rounded square

---

## 3. `favicon.png` - Web Favicon

**Size:** `48 x 48 pixels` (current) or `32 x 32 pixels` (recommended)
**Format:** PNG
**Usage:**
- Browser favicon for web version
- Displayed in browser tabs, bookmarks, history

**Requirements:**
- Square format
- Small size (32x32 or 48x48)
- Should be recognizable at very small sizes
- Simple design works best

**Current Status:** ✅ 48 x 48 (8-bit gray+alpha)

**Recommendation:** You can use 32x32 or 48x48, both work fine. 32x32 is more standard.

---

## 4. `splash-icon.png` - Splash Screen Icon

**Size:** `1024 x 1024 pixels`
**Format:** PNG
**Usage:**
- Displayed on the splash screen when app launches
- Shown during app initialization
- Background color: `#ffffff` (white) as configured in `app.json`

**Requirements:**
- Square format (1024 x 1024)
- Should work well on white background
- Typically your app logo/icon
- Can be the same as `icon.png` or a variation

**Current Status:** ✅ 1024 x 1024 (8-bit colormap)

---

## Summary Table

| File | Size | Format | Usage | Safe Zone |
|------|------|--------|-------|-----------|
| `icon.png` | 1024 x 1024 | PNG | iOS/Android app icon, push notifications | Full image |
| `adaptive-icon.png` | 1024 x 1024 | PNG | Android adaptive icon (foreground) | Center 66% |
| `favicon.png` | 32 x 32 or 48 x 48 | PNG | Web browser favicon | Full image |
| `splash-icon.png` | 1024 x 1024 | PNG | Splash screen | Full image |

---

## Photoshop Setup Recommendations

### For `icon.png` and `splash-icon.png`:
1. Create new document: **1024 x 1024 pixels**
2. Resolution: **72 DPI** (standard for screen)
3. Color mode: **RGB**
4. Background: **White** or your brand color
5. Design your icon centered
6. Export as PNG (no transparency needed)

### For `adaptive-icon.png`:
1. Create new document: **1024 x 1024 pixels**
2. Resolution: **72 DPI**
3. Color mode: **RGB**
4. Add guides at:
   - Horizontal: 170px and 854px (top/bottom safe zone)
   - Vertical: 170px and 854px (left/right safe zone)
5. Keep important content within the center 676 x 676 area
6. Export as PNG (transparency OK for outer areas)

### For `favicon.png`:
1. Create new document: **32 x 32 pixels** or **48 x 48 pixels**
2. Resolution: **72 DPI**
3. Color mode: **RGB**
4. Simple, recognizable design
5. Export as PNG

---

## Design Guidelines

1. **Consistency:** All icons should share the same visual style
2. **Simplicity:** Icons should be recognizable at small sizes
3. **Contrast:** Ensure good contrast with backgrounds
4. **No Text:** Avoid text in icons (except maybe single letter/initial)
5. **Brand Colors:** Use your brand colors consistently

---

## Testing After Creation

1. **Preview in Expo:**
   ```bash
   npx expo start
   ```
   Check how icons appear in the app

2. **Test Adaptive Icon:**
   - Build Android app and test on device
   - Check how it looks in different launcher shapes

3. **Test Favicon:**
   - Run web version: `npx expo start --web`
   - Check browser tab to see favicon

---

## File Locations

All icons should be placed in:
```
/assets/
  ├── icon.png
  ├── adaptive-icon.png
  ├── favicon.png
  └── splash-icon.png
```

---

## References

- [Expo App Icons Guide](https://docs.expo.dev/guides/app-icons/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

