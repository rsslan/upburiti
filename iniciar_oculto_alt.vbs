' ================================================================
' Versão alternativa do VBS - Se iniciar_oculto.vbs der erro
' Duplo clique neste arquivo
' ================================================================

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtém o diretório
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strBatFile = """" & objFSO.BuildPath(strPath, "iniciar_completo.bat") & """"

' Tenta executar o .bat
On Error Resume Next
objShell.Run "cmd.exe /c " & strBatFile, 0, False
If Err.Number <> 0 Then
    MsgBox "Erro ao iniciar o processo principal. Verifique se 'iniciar_completo.bat' existe e tem permissão.", 16, "Erro de Execução"
    WScript.Quit 1
End If
On Error GoTo 0 ' Resetar tratamento de erro

' Aguarda 3 segundos
WScript.Sleep 3000

' Abre o navegador
strUrl = "http://localhost:5173"

' Tenta abrir no navegador padrão usando ShellExecute
Set objShellApp = CreateObject("Shell.Application")
objShellApp.ShellExecute strUrl, "", "", "open", 1 ' 1 para mostrar a janela (navegador)
Set objShellApp = Nothing
