@echo off
cd /d "%~dp0"

setlocal enabledelayedexpansion
set SOURCE_DIR=%~dp0
set DEST_DIR=%SOURCE_DIR%public\data

if not exist "!DEST_DIR!" mkdir "!DEST_DIR!"

for %%F in ("%SOURCE_DIR%*.xlsx" "%SOURCE_DIR%*.xls") do (
    if exist "%%F" copy "%%F" "!DEST_DIR!\" > nul 2>&1
)

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

if not exist "dist" (
    echo Compilando projeto...
    call npm run build
)

echo ========================================
echo Sistema iniciado! http://localhost:5173
echo ========================================

node server.js
endlocal