@echo off
echo ========================================
echo RAY Platform - Quick Test Runner
echo ========================================
echo.
echo Select which app to test:
echo.
echo 1. ray-web (User App)
echo 2. ray-admin (Admin Dashboard)
echo 3. Both (Full Suite)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto test_web
if "%choice%"=="2" goto test_admin
if "%choice%"=="3" goto test_both
if "%choice%"=="4" goto end

:test_web
echo.
echo Running ray-web tests...
cd ray-web
call npm run test:e2e:ui
cd ..
goto end

:test_admin
echo.
echo Running ray-admin tests...
cd ray-admin
call npm run test:e2e:ui
cd ..
goto end

:test_both
echo.
echo Running all tests...
call run-all-tests.bat
goto end

:end
echo.
echo Done!
pause
