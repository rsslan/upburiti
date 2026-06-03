<<<<<<< HEAD
# ================================================================
# Encontre o IP da sua máquina para acessar no celular
# ================================================================
# Windows: Abra o Prompt de Comando e execute:
# ipconfig
# 
# Procure por "IPv4 Address" na sua rede WiFi
# Exemplo: 192.168.1.100
#
# Depois acesse no celular: http://192.168.1.100:5173
# ================================================================

$ipv4 = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match "^192\.|^10\.|^172\." } | Select-Object -First 1 | ForEach-Object { $_.IPAddress }

Write-Host "=========================================="
Write-Host "IP LOCAL (para acessar no celular):"
Write-Host "http://$ipv4:5173"
Write-Host "=========================================="
Write-Host ""
Write-Host "Instrucoes:"
Write-Host "1. Certifique-se de que seu celular esta na mesma rede WiFi"
Write-Host "2. Abra o navegador no celular"
Write-Host "3. Digite: http://$ipv4:5173"
Write-Host ""
=======
# ================================================================
# Encontre o IP da sua máquina para acessar no celular
# ================================================================
# Windows: Abra o Prompt de Comando e execute:
# ipconfig
# 
# Procure por "IPv4 Address" na sua rede WiFi
# Exemplo: 192.168.1.100
#
# Depois acesse no celular: http://192.168.1.100:5173
# ================================================================

$ipv4 = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match "^192\.|^10\.|^172\." } | Select-Object -First 1 | ForEach-Object { $_.IPAddress }

Write-Host "=========================================="
Write-Host "IP LOCAL (para acessar no celular):"
Write-Host "http://$ipv4:5173"
Write-Host "=========================================="
Write-Host ""
Write-Host "Instrucoes:"
Write-Host "1. Certifique-se de que seu celular esta na mesma rede WiFi"
Write-Host "2. Abra o navegador no celular"
Write-Host "3. Digite: http://$ipv4:5173"
Write-Host ""
>>>>>>> a307d3e394a9c71586f20b55de19704c0e651fc6
