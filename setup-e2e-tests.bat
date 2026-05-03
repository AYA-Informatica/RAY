@echo off
echo ========================================
echo RAY Platform - E2E Testing Setup
echo ========================================
echo.
echo This script will:
echo 1. Install Playwright in both apps
echo 2. Install browser binaries
echo 3. Verify installation
echo.
pause

echo.
echo [1/4] Installing Playwright for ray-web...
cd ray-web
call npm install
call npx playwright install chromium firefox webkit
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Playwright for ray-web
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing Playwright for ray-admin...
cd ray-admin
call npm install
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Playwright for ray-admin
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Verifying installation...
cd ray-web
call npx playwright --version
cd ..

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Run tests with UI mode (recommended):
echo    - cd ray-web ^&^& npm run test:e2e:ui
echo    - cd ray-admin ^&^& npm run test:e2e:ui
echo.
echo 2. Run all tests:
echo    - run-all-tests.bat
echo.
echo 3. Quick test menu:
echo    - test-quick.bat
echo.
echo 4. Read the guide:
echo    - E2E_TESTING_GUIDE.md
echo.
pause
