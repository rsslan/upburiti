@echo off
REM Script para iniciar o sistema com o CMD oculto
REM Este arquivo .bat será chamado pelo .vbs para ficar oculto

cd /d "%~dp0"

REM Copia arquivos Excel para pasta public/data
setlocal enabledelayedexpansion
set SOURCE_DIR=%~dp0
set DEST_DIR=%SOURCE_DIR%public\data

if not exist "!DEST_DIR!" mkdir "!DEST_DIR!"

REM Copia arquivos
for %%F in ("%SOURCE_DIR%*.xlsx" "%SOURCE_DIR%*.xls") do (
    if exist "%%F" copy "%%F" "!DEST_DIR!\" > nul 2>&1
)

REM Verifica se node_modules existe
if not exist "node_modules" (
    cls
    echo.
    echo Instalando dependencias pela primeira vez...
    echo Por favor, aguarde...
    echo.
    call npm install
    if !errorlevel! neq 0 (
        echo ERRO: Falha na instalacao. Tente novamente.
        timeout /t 5
        exit /b 1
    )
)

REM Verifica se dist existe
if not exist "dist" (
    cls
    echo.
    echo Compilando projeto...
    echo Por favor, aguarde...
    echo.
    call npm run build
    if !errorlevel! neq 0 (
        echo ERRO: Falha na compilacao. Tente novamente.
        timeout /t 5
        exit /b 1
    )
)

REM Inicia o servidor
echo.
echo ========================================
echo Sistema iniciado com sucesso!
echo Acesso: http://localhost:5173
echo ========================================
echo.

node server.js

endlocal

