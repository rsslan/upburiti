@echo off
REM Muda para o diretório do script
cd /d "%~dp0"

setlocal enabledelayedexpansion
set SOURCE_DIR=%~dp0
set DEST_DIR=%SOURCE_DIR%public\data

REM Cria diretório public\data se não existir
if not exist "!DEST_DIR!" (
    echo Criando diretório !DEST_DIR!...
    mkdir "!DEST_DIR!"
)

REM Copia arquivos Excel
echo Copiando arquivos Excel...
for %%F in ("%SOURCE_DIR%*.xlsx" "%SOURCE_DIR%*.xls") do (
    if exist "%%F" (
        echo Copiando: %%F
        copy "%%F" "!DEST_DIR!\" > nul 2>&1
    )
)

REM Verifica e instala dependências
if not exist "node_modules" (
    echo.
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERRO: Falha ao instalar dependências. Verifique se Node.js está instalado.
        pause
        exit /b 1
    )
)

REM Compila o projeto para desenvolvimento local
if not exist "dist" (
    echo.
    echo Compilando projeto para localhost...
    call npm run build
    if errorlevel 1 (
        echo ERRO: Falha ao compilar. Verifique os erros acima.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Iniciando servidor Vite (força recarga) ...
echo Acesso PC:     http://localhost:5173
echo Pressione Ctrl+C para parar
echo ========================================
echo.

REM Usa Vite com --force para evitar cache antigo
call npx vite --force

endlocal
echo Acesso local: http://localhost:5173
echo Pressione Ctrl+C para parar
echo ========================================
echo.

REM Inicia o servidor
node server.js
if errorlevel 1 (
    echo ERRO: Falha ao iniciar o servidor Node.
    echo Verifique se node_modules foi instalado corretamente.
    pause
    exit /b 1
)

endlocal