<<<<<<< HEAD
@echo off
cd /d "%~dp0"

:: Compila o projeto se ainda não existir dist
if not exist "dist\" (
    echo Compilando o projeto...
    call npm run build
)

:: Inicia o servidor production
echo.
echo ================================================
echo Iniciando Sistema de Gestao de Obra
echo ================================================
echo.
echo URL de acesso: http://localhost:5173
echo Para acessar no celular: http://seu-ip:5173
echo.

node server.js
pause
=======
@echo off
cd /d "%~dp0"

:: Compila o projeto se ainda não existir dist
if not exist "dist\" (
    echo Compilando o projeto...
    call npm run build
)

:: Inicia o servidor production
echo.
echo ================================================
echo Iniciando Sistema de Gestao de Obra
echo ================================================
echo.
echo URL de acesso: http://localhost:5173
echo Para acessar no celular: http://seu-ip:5173
echo.

node server.js
pause
>>>>>>> a307d3e394a9c71586f20b55de19704c0e651fc6
