@echo off
echo ========================================
echo   RAY Platform - Deploy Web Apps
echo ========================================
echo.

:menu
echo Choose deployment option:
echo.
echo 1. Deploy Web App to Vercel
echo 2. Deploy Admin App to Vercel
echo 3. Deploy Both to Vercel
echo 4. Deploy Web App to Firebase
echo 5. Deploy Admin App to Firebase
echo 6. Deploy Both to Firebase
echo 7. Build Only (no deploy)
echo 8. Exit
echo.
set /p choice="Enter choice (1-8): "

if "%choice%"=="1" goto deploy_web_vercel
if "%choice%"=="2" goto deploy_admin_vercel
if "%choice%"=="3" goto deploy_both_vercel
if "%choice%"=="4" goto deploy_web_firebase
if "%choice%"=="5" goto deploy_admin_firebase
if "%choice%"=="6" goto deploy_both_firebase
if "%choice%"=="7" goto build_only
if "%choice%"=="8" goto end
goto menu

:deploy_web_vercel
echo.
echo Building ray-web...
cd ray-web
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    goto menu
)
echo.
echo Deploying to Vercel...
call vercel --prod
cd ..
echo.
echo Done! Check the URL above.
pause
goto menu

:deploy_admin_vercel
echo.
echo Building ray-admin...
cd ray-admin
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    goto menu
)
echo.
echo Deploying to Vercel...
call vercel --prod
cd ..
echo.
echo Done! Check the URL above.
pause
goto menu

:deploy_both_vercel
echo.
echo Building ray-web...
cd ray-web
call npm run build
if errorlevel 1 (
    echo Web build failed!
    pause
    goto menu
)
echo Deploying ray-web...
call vercel --prod
cd ..
echo.
echo Building ray-admin...
cd ray-admin
call npm run build
if errorlevel 1 (
    echo Admin build failed!
    pause
    goto menu
)
echo Deploying ray-admin...
call vercel --prod
cd ..
echo.
echo Done! Both apps deployed.
pause
goto menu

:deploy_web_firebase
echo.
echo Building ray-web...
cd ray-web
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    goto menu
)
cd ..
echo.
echo Deploying to Firebase...
call firebase deploy --only hosting:web
echo.
echo Done!
pause
goto menu

:deploy_admin_firebase
echo.
echo Building ray-admin...
cd ray-admin
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    goto menu
)
cd ..
echo.
echo Deploying to Firebase...
call firebase deploy --only hosting:admin
echo.
echo Done!
pause
goto menu

:deploy_both_firebase
echo.
echo Building ray-web...
cd ray-web
call npm run build
if errorlevel 1 (
    echo Web build failed!
    pause
    goto menu
)
cd ..
echo.
echo Building ray-admin...
cd ray-admin
call npm run build
if errorlevel 1 (
    echo Admin build failed!
    pause
    goto menu
)
cd ..
echo.
echo Deploying both to Firebase...
call firebase deploy --only hosting
echo.
echo Done!
pause
goto menu

:build_only
echo.
echo Building ray-web...
cd ray-web
call npm run build
if errorlevel 1 (
    echo Web build failed!
    pause
    goto menu
)
cd ..
echo.
echo Building ray-admin...
cd ray-admin
call npm run build
if errorlevel 1 (
    echo Admin build failed!
    pause
    goto menu
)
cd ..
echo.
echo Both apps built successfully!
echo Web: ray-web/dist
echo Admin: ray-admin/dist
pause
goto menu

:end
echo.
echo Goodbye!
