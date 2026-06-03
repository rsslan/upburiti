@echo off
REM Script para obter o IP local do computador
REM Útil para acessar do celular

echo.
echo ==========================================
echo Seu IP local (para acessar do celular):
echo ==========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo http://!ip!:5173
)

echo.
echo ==========================================
echo Copie o URL acima e acesse no celular
echo ==========================================
echo.
pause
