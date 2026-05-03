@echo off
echo ========================================
echo RAY Platform - E2E Test Suite Runner
echo ========================================
echo.

REM Check if Playwright is installed
echo [1/6] Checking Playwright installation...
cd ray-web
call npm list @playwright/test >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Playwright for ray-web...
    call npm install
    call npx playwright install
)
cd ..

cd ray-admin
call npm list @playwright/test >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Playwright for ray-admin...
    call npm install
    call npx playwright install
)
cd ..

echo.
echo ========================================
echo [2/6] Running RAY-WEB Tests
echo ========================================
echo.

cd ray-web
call npm run test:e2e
set WEB_EXIT_CODE=%errorlevel%
cd ..

echo.
echo ========================================
echo [3/6] Running RAY-ADMIN Tests
echo ========================================
echo.

cd ray-admin
call npm run test:e2e
set ADMIN_EXIT_CODE=%errorlevel%
cd ..

echo.
echo ========================================
echo [4/6] Test Results Summary
echo ========================================
echo.

if %WEB_EXIT_CODE% equ 0 (
    echo [PASS] ray-web tests: PASSED
) else (
    echo [FAIL] ray-web tests: FAILED
)

if %ADMIN_EXIT_CODE% equ 0 (
    echo [PASS] ray-admin tests: PASSED
) else (
    echo [FAIL] ray-admin tests: FAILED
)

echo.
echo ========================================
echo [5/6] Generating Reports
echo ========================================
echo.

echo Opening ray-web test report...
cd ray-web
start npx playwright show-report
cd ..

timeout /t 2 /nobreak >nul

echo Opening ray-admin test report...
cd ray-admin
start npx playwright show-report
cd ..

echo.
echo ========================================
echo [6/6] Test Execution Complete
echo ========================================
echo.

if %WEB_EXIT_CODE% equ 0 if %ADMIN_EXIT_CODE% equ 0 (
    echo Status: ALL TESTS PASSED
    echo.
    echo Next steps:
    echo - Review test reports in browser
    echo - Check screenshots for any warnings
    echo - Deploy with confidence!
    exit /b 0
) else (
    echo Status: SOME TESTS FAILED
    echo.
    echo Next steps:
    echo - Review failed tests in reports
    echo - Check screenshots and traces
    echo - Fix issues and re-run tests
    exit /b 1
)
