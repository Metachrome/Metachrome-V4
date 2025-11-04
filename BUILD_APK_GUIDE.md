# 📱 METACHROME APK Build Guide

Complete guide to build METACHROME Android APK from the web application.

---

## ✅ Prerequisites

### 1. **Install Android Studio**
- Download from: https://developer.android.com/studio
- Install with default settings
- Make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (optional, for testing)

### 2. **Install Java JDK**
- Download JDK 17 or higher from: https://www.oracle.com/java/technologies/downloads/
- Or use OpenJDK: https://adoptium.net/
- Set JAVA_HOME environment variable

### 3. **Set Environment Variables**
Add these to your system PATH:
```
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

---

## 🚀 Quick Build Steps

### **Option 1: Build Debug APK (Fastest)**

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Build APK in Android Studio:**
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### **Option 2: Build via Command Line (No Android Studio UI)**

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Build Debug APK:**
   ```bash
   cd android
   gradlew assembleDebug
   ```

4. **APK Location:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

### **Option 3: Build Release APK (Production)**

#### **Step 1: Generate Keystore**

```bash
keytool -genkey -v -keystore metachrome-release-key.keystore -alias metachrome -keyalg RSA -keysize 2048 -validity 10000
```

**Enter details:**
- Password: `[Choose a strong password]`
- Name: `METACHROME Team`
- Organization: `METACHROME`
- City: `[Your City]`
- State: `[Your State]`
- Country: `[Your Country Code]`

**Save the keystore file and password securely!**

---

#### **Step 2: Configure Signing**

Create file: `android/key.properties`

```properties
storePassword=[Your Keystore Password]
keyPassword=[Your Key Password]
keyAlias=metachrome
storeFile=../metachrome-release-key.keystore
```

---

#### **Step 3: Update build.gradle**

Edit: `android/app/build.gradle`

Add before `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android {`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

#### **Step 4: Build Release APK**

```bash
npm run build
npx cap sync android
cd android
gradlew assembleRelease
```

**Release APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Build Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build web app to `dist/public` |
| `npx cap sync android` | Copy web assets to Android project |
| `npx cap open android` | Open project in Android Studio |
| `cd android && gradlew assembleDebug` | Build debug APK |
| `cd android && gradlew assembleRelease` | Build release APK |
| `cd android && gradlew bundleRelease` | Build AAB for Play Store |

---

## 🎨 Customize App

### **1. Change App Name**

Edit: `capacitor.config.ts`
```typescript
appName: 'METACHROME',  // Change this
```

### **2. Change App Icon**

1. Generate icons: https://icon.kitchen/
2. Replace files in: `android/app/src/main/res/`
   - `mipmap-hdpi/ic_launcher.png`
   - `mipmap-mdpi/ic_launcher.png`
   - `mipmap-xhdpi/ic_launcher.png`
   - `mipmap-xxhdpi/ic_launcher.png`
   - `mipmap-xxxhdpi/ic_launcher.png`

### **3. Change Package Name**

Edit: `capacitor.config.ts`
```typescript
appId: 'io.metachrome.app',  // Change this
```

Then run:
```bash
npx cap sync android
```

### **4. Change App Version**

Edit: `android/app/build.gradle`
```gradle
versionCode 1        // Increment for each release
versionName "1.0.0"  // User-facing version
```

---

## 🧪 Testing APK

### **Install on Physical Device:**

1. Enable **Developer Options** on Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### **Install on Emulator:**

1. Start Android Emulator from Android Studio
2. Drag and drop APK file onto emulator

---

## 🚨 Troubleshooting

### **Error: ANDROID_HOME not set**
```bash
# Windows
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Restart terminal
```

### **Error: Java not found**
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Restart terminal
```

### **Error: Gradle build failed**
```bash
cd android
gradlew clean
gradlew assembleDebug
```

### **Error: Web assets not found**
```bash
npm run build
npx cap copy android
npx cap sync android
```

---

## 📤 Distribute APK

### **Option 1: Direct APK Distribution**
- Share `app-release.apk` file directly
- Users need to enable "Install from Unknown Sources"

### **Option 2: Google Play Store**
1. Build AAB (Android App Bundle):
   ```bash
   cd android
   gradlew bundleRelease
   ```
2. Upload `app-release.aab` to Google Play Console
3. Follow Play Store submission process

---

## 🔐 Security Notes

1. **Never commit keystore files to Git**
2. **Keep keystore password secure**
3. **Backup keystore file** - you cannot recover it if lost
4. **Use different keystores** for debug and release builds

---

## 📝 Current Configuration

- **App ID:** `io.metachrome.app`
- **App Name:** `METACHROME`
- **Web Dir:** `dist/public`
- **Server URL:** `https://metachrome.io`
- **Android Scheme:** `https`

---

## 🎯 Next Steps

1. ✅ Install Android Studio
2. ✅ Set environment variables
3. ✅ Build debug APK for testing
4. ✅ Test on device/emulator
5. ✅ Generate release keystore
6. ✅ Build release APK
7. ✅ Distribute or publish to Play Store

---

## 📞 Support

For issues or questions:
- Check Android Studio logs
- Check Capacitor docs: https://capacitorjs.com/docs
- Check Gradle logs: `android/build/outputs/logs/`

---

**Built with ❤️ by METACHROME Team**

