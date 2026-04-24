' ================================================================
' Script para executar o sistema SEM mostrar a janela do CMD
' Duplo clique neste arquivo para iniciar
' ================================================================

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtém o diretório do script
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strBatFile = objFSO.BuildPath(strPath, "iniciar_completo.bat")

' Executa o .bat de forma completamente oculta
' Adiciona aspas para suportar caminhos com espaços
objShell.Run """" & strBatFile & """", 0, False

' Aguarda o servidor iniciar
WScript.Sleep 3000

' Abre o navegador automaticamente
strUrl = "http://localhost:5173"

' Tenta abrir no navegador padrão usando ShellExecute
' Este método é geralmente mais robusto para abrir URLs
Set objShellApp = CreateObject("Shell.Application")
objShellApp.ShellExecute strUrl, "", "", "open", 1 ' 1 para mostrar a janela (navegador)
Set objShellApp = Nothing
