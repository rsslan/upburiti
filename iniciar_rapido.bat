@echo off
REM Inicia em MODO DESENVOLVIMENTO (Vite Dev Server)
REM Muito mais rápido e sem problemas de paths!

cd /d "%~dp0"

setlocal enabledelayedexpansion
set SOURCE_DIR=%~dp0
set DEST_DIR=%SOURCE_DIR%public\data

REM Cria diretório public\data se não existir
if not exist "!DEST_DIR!" (
    mkdir "!DEST_DIR!"
)

REM Copia arquivos Excel
for %%F in ("%SOURCE_DIR%*.xlsx" "%SOURCE_DIR%*.xls") do (
    if exist "%%F" copy "%%F" "!DEST_DIR!\" > nul 2>&1
)

REM Verifica e instala dependências apenas na primeira vez
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo ========================================
echo MODO DESENVOLVIMENTO - Vite com --force
echo Acesso PC:     http://localhost:5173
echo Pressione Ctrl+C para parar
echo ========================================
echo.

REM IMPORTANTE: Usa Vite com --force para evitar cache antigo
call npx vite --force

endlocal
