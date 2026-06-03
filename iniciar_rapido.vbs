' ================================================================
' Script para iniciar em MODO RÁPIDO (Desenvolvimento)
' Vite dev server inicia em 2-3 segundos
' Duplo clique para iniciar
' ================================================================

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtém o diretório do script
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strBatFile = objFSO.BuildPath(strPath, "iniciar_rapido.bat")

' Executa o .bat de forma oculta
On Error Resume Next
objShell.Run """" & strBatFile & """", 0, False
If Err.Number <> 0 Then
    MsgBox "Erro ao iniciar. Verifique se 'iniciar_rapido.bat' existe.", 16, "Erro"
    WScript.Quit 1
End If
On Error GoTo 0

' Aguarda apenas 5 segundos (Vite dev é rápido!)
WScript.Sleep 5000

' Abre o navegador
strUrl = "http://localhost:5173"

On Error Resume Next
Set objShellApp = CreateObject("Shell.Application")
objShellApp.ShellExecute strUrl, "", "", "open", 1
Set objShellApp = Nothing
On Error GoTo 0
