@echo off
echo ========================================
echo METACHROME APK Builder
echo ========================================
echo.

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

echo [3/4] Building Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Android build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Android APK build completed
echo.

echo [4/4] APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.

echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Next steps:
echo 1. Install APK on your Android device
echo 2. Or open in Android Studio: npx cap open android
echo.
pause

