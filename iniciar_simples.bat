@echo off
REM Alternativa simples: inicia o servidor e abre o navegador
REM Use este arquivo se iniciar_oculto.vbs der erro

cd /d "%~dp0"

REM Inicia o servidor em background
start /B node server.js

REM Aguarda 3 segundos para o servidor iniciar
timeout /t 3 /nobreak > nul

REM Abre o navegador
start http://localhost:5173

REM Fecha esta janela
exit
