# Building Stremio Kai APK

This guide explains how to build an Android APK from the web app using Capacitor.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Android Studio** - [Download](https://developer.android.com/studio)
3. **Java JDK 17+** - Usually included with Android Studio

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

This creates a static export in the `out/` directory.

### 3. Initialize Capacitor (First Time Only)

```bash
npm run cap:add:android
```

This creates the `android/` folder with the native project.

### 4. Sync Web Assets to Android

```bash
npm run cap:sync
```

This copies the built web app into the Android project.

### 5. Open in Android Studio

```bash
npm run cap:open:android
```

### 6. Build APK in Android Studio

1. Wait for Gradle sync to complete
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. The APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`

## Building a Release APK

For a signed release APK:

1. In Android Studio, go to **Build > Generate Signed Bundle / APK**
2. Choose **APK**
3. Create or use an existing keystore
4. Build the release APK

## Quick Commands

```bash
# Full build process
npm run apk:build && npm run cap:open:android

# Just sync changes (after code changes)
npm run cap:sync
```

## App Configuration

Edit `capacitor.config.ts` to change:
- `appId` - Package name (e.g., `com.yourname.stremiokai`)
- `appName` - Display name
- Splash screen settings
- Status bar settings

## Troubleshooting

### CORS Issues
The app uses Stremio addon APIs which may have CORS restrictions. Most community addons support CORS, but some may not work on mobile.

### Video Playback
Some video streams may not play due to:
- Format incompatibility (WebView supports limited codecs)
- CORS restrictions on video URLs
- DRM-protected content

### Build Errors
1. Make sure Android SDK is installed
2. Accept all SDK licenses: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses`
3. Ensure Gradle has internet access

## Features

- Browse movies and series from Stremio addons
- Search content
- Watchlist (saved locally)
- Watch history
- Video playback (HTTP streams)
- Dark theme matching Stremio Kai style

## Limitations vs Windows Version

This mobile version does not include:
- MPV player (uses HTML5 video)
- VapourSynth/SVP video processing
- HDR passthrough
- Lua scripting
- Torrent downloading (streaming only)

These features require native code that cannot run in a WebView.
