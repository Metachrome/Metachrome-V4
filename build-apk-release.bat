@echo off
echo ========================================
echo METACHROME RELEASE APK Builder
echo ========================================
echo.

echo WARNING: This will build a RELEASE APK
echo Make sure you have:
echo 1. Generated keystore file
echo 2. Created android/key.properties
echo 3. Configured signing in build.gradle
echo.
pause

echo [1/4] Building web application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo ✓ Web build completed
echo.

echo [2/4] Syncing Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo ✓ Capacitor sync completed
echo.

echo [3/4] Building Android RELEASE APK...
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: Android build failed!
    echo.
    echo Common issues:
    echo - Keystore file not found
    echo - key.properties not configured
    echo - Signing config not set in build.gradle
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Android RELEASE APK build completed
echo.

echo [4/4] APK Location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.

echo ========================================
echo RELEASE BUILD SUCCESSFUL!
echo ========================================
echo.
echo This APK is ready for distribution!
echo.
pause

