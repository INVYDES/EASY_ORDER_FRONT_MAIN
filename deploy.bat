@echo off
echo ============================================
echo DEPLOY FRONTEND -> BACKEND LARAVEL
echo ============================================
echo.
echo Este script:
echo   1. Hace build del frontend (npm run build)
echo   2. Copia dist/ al backend (public/dist)
echo.

REM 1. Build del frontend
echo Ejecutando npm run build...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR en el build!
    pause
    exit /b 1
)

REM 2. Copiar al backend
echo.
echo Copiando dist/ al backend...
set BACKEND_PATH=..\Back-endApi\public\dist

REM Limpiar dist anterior del backend
if exist "%BACKEND_PATH%" rmdir /s /q "%BACKEND_PATH%"

REM Copiar nuevo dist
xcopy /E /I /Y dist "%BACKEND_PATH%"

echo.
echo ============================================
echo DEPLOY COMPLETADO!
echo ============================================
echo.
echo Para usar el frontend:
echo   1. En el backend, ejecuta: php artisan serve
echo   2. En otra terminal: php artisan reverb:start
echo   3. Abre: http://localhost:8000
echo.
echo Si usas tunel:
echo   1. Actualiza el .env del frontend con la URL del tunel
echo   2. Vuelve a ejecutar este script
echo   3. Actualiza el .env del backend con la misma URL
echo ============================================

pause
