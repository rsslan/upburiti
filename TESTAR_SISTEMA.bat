@echo off
chcp 65001 > nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        TESTE DO SISTEMA - GESTÃO DE OBRA                  ║
echo ║              SPE JARDIM LUZ                                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/5] Verificando arquivos necessários...
if not exist "dist" (
    echo ✗ ERRO: Pasta 'dist' não encontrada!
    echo         Execute: npm run build
    pause
    exit /b 1
)
echo ✓ Pasta dist encontrada

if not exist "server.js" (
    echo ✗ ERRO: Arquivo 'server.js' não encontrado!
    pause
    exit /b 1
)
echo ✓ Arquivo server.js encontrado

if not exist "node_modules" (
    echo ✗ ERRO: Dependências não instaladas!
    echo         Execute: npm install
    pause
    exit /b 1
)
echo ✓ Dependências instaladas

echo.
echo [2/5] Verificando porta 5173...
netstat -ano | findstr :5173 > nul
if %errorlevel% equ 0 (
    echo ⚠  AVISO: Porta 5173 já está em uso
    echo           Alterando para porta 5174...
    set PORT=5174
) else (
    echo ✓ Porta 5173 disponível
    set PORT=5173
)

echo.
echo [3/5] Iniciando servidor...
echo       Aguarde 3 segundos...
timeout /t 3 /nobreak > nul

echo.
echo [4/5] Abrindo navegador...
start "Dashboard" "http://localhost:%PORT%"

echo.
echo [5/5] Sistema iniciado!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✓ Sistema rodando em: http://localhost:%PORT%             ║
echo ║                                                            ║
echo ║  Para acessar no CELULAR:                                  ║
echo ║  1. Execute: Obter_IP_Celular.bat                          ║
echo ║  2. Digite o IP + :5173 no navegador do celular           ║
echo ║                                                            ║
echo ║  Quando fechar a aba, o servidor desliga sozinho ✓        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Inicia o servidor
node server.js

pause
