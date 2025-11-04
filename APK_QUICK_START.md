# 📱 METACHROME APK - Quick Start

## 🚀 Fastest Way to Build APK

### **Prerequisites:**
1. Install **Android Studio**: https://developer.android.com/studio
2. Install **Java JDK 17+**: https://adoptium.net/

---

## ⚡ Quick Build (3 Steps)

### **Method 1: Using Batch Script (Easiest)**

```bash
# Double-click this file:
build-apk.bat
```

**APK Location:** `android\app\build\outputs\apk\debug\app-debug.apk`

---

### **Method 2: Using NPM Commands**

```bash
# Step 1: Build web app
npm run build

# Step 2: Sync to Android
npm run android:sync

# Step 3: Build APK
npm run android:build:debug
```

**APK Location:** `android\app\build\outputs\apk\debug\app-debug.apk`

---

### **Method 3: Using Android Studio (Visual)**

```bash
# Open Android Studio
npm run android:open

# Then in Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## 📦 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build web application |
| `npm run android:sync` | Sync web assets to Android |
| `npm run android:open` | Open in Android Studio |
| `npm run android:build` | Build web + sync |
| `npm run android:build:debug` | Build debug APK |
| `npm run android:build:release` | Build release APK |

---

## 📱 Install APK on Device

### **Option 1: USB Cable**
```bash
# Connect device via USB
# Enable USB Debugging on device
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### **Option 2: File Transfer**
1. Copy `app-debug.apk` to your phone
2. Open file on phone
3. Allow "Install from Unknown Sources"
4. Install

---

## 🎯 Build Release APK (Production)

See full guide: [BUILD_APK_GUIDE.md](BUILD_APK_GUIDE.md)

Quick steps:
1. Generate keystore
2. Configure signing
3. Run: `build-apk-release.bat`

---

## 🚨 Common Issues

### **"ANDROID_HOME not set"**
```bash
# Set environment variable:
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
# Restart terminal
```

### **"Java not found"**
```bash
# Set environment variable:
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
# Restart terminal
```

### **"Gradle build failed"**
```bash
cd android
gradlew clean
cd ..
npm run android:build:debug
```

---

## ✅ Current Setup

- ✅ Capacitor configured
- ✅ Android platform added
- ✅ Build scripts ready
- ✅ Web assets synced

**App Details:**
- **Name:** METACHROME
- **Package:** io.metachrome.app
- **Version:** 1.0.0

---

## 📞 Need Help?

Read full guide: [BUILD_APK_GUIDE.md](BUILD_APK_GUIDE.md)

---

**Ready to build! 🚀**

