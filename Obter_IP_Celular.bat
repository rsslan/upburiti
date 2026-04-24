<<<<<<< HEAD
@echo off
REM Este script ajuda você a encontrar seu IP para acessar no celular

echo.
echo ========================================
echo ENCONTRANDO SEU IP LOCAL
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
)

set "ip=%ip: =%"

echo IP ENCONTRADO: %ip%
echo.
echo Digite no navegador do seu CELULAR:
echo http://%ip%:5173
echo.
echo Certifique-se que seu celular está na mesma rede WiFi
echo.
pause
=======
@echo off
REM Este script ajuda você a encontrar seu IP para acessar no celular

echo.
echo ========================================
echo ENCONTRANDO SEU IP LOCAL
echo ========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set "ip=%%a"
)

set "ip=%ip: =%"

echo IP ENCONTRADO: %ip%
echo.
echo Digite no navegador do seu CELULAR:
echo http://%ip%:5173
echo.
echo Certifique-se que seu celular está na mesma rede WiFi
echo.
pause
>>>>>>> a307d3e394a9c71586f20b55de19704c0e651fc6
