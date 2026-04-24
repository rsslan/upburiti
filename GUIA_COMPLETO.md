# 🔧 GUIA DE USO - Sistema de Gestão de Obra

## ✅ REQUISITOS IMPLEMENTADOS

### 1️⃣ CMD OCULTO (Sem mostrar a janela)
✓ Duplo clique em **`iniciar_oculto.vbs`** para iniciar com o CMD totalmente oculto
✓ O servidor roda em background sem mostrar nenhuma janela
✓ Browser abre automaticamente

### 2️⃣ FECHAMENTO AUTOMÁTICO
✓ Quando você **fecha a aba do navegador**, o servidor se desliga automaticamente
✓ Se ficar **10 minutos inativo**, o servidor também se desliga
✓ Se sair da aba por **5 minutos**, se desliga

### 3️⃣ ACESSO NO CELULAR (Android/iPhone)
✓ Mesma rede WiFi
✓ Sem instalar nada (funciona no navegador)
✓ Totalmente responsivo e otimizado para mobile

---

## 🚀 COMO USAR

### **Primeira Vez - Instalação**
```
1. Abra o Prompt de Comando (cmd) nesta pasta
2. Execute: npm install
3. Execute: npm run build
```

### **Iniciar Normalmente (COM CMD visível)**
```
Duplo clique em: iniciar.bat
```

### **Iniciar OCULTO (SEM CMD visível) ⭐ RECOMENDADO**
```
Duplo clique em: iniciar_oculto.vbs
```
- O servidor inicia sem mostrar nenhuma janela
- Browser abre automaticamente
- Quando fechar a aba, o servidor desliga sozinho

### **No Celular (Android/iPhone)**

#### Passo 1: Encontre o IP da sua máquina
Execute no Prompt de Comando:
```
ipconfig
```
Procure por **"IPv4 Address"** (será algo como 192.168.1.100)

#### Passo 2: Acesse no celular
1. Certifique-se que seu celular está na **mesma rede WiFi** do PC
2. Abra o navegador no celular
3. Digite: `http://SEU_IP:5173`
   - Exemplo: `http://192.168.1.100:5173`

#### Passo 3: Use normalmente
- Funciona igual ao computador
- Interface totalmente otimizada para tela sensível ao toque
- Todos os gráficos e dados funcionam

---

## 🔄 FLUXO DE FUNCIONAMENTO

```
┌─────────────────────┐
│ Duplo clique em VBS │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│ Servidor inicia OCULTO   │
│ (sem mostrar CMD)        │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Browser abre             │
│ http://localhost:5173    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Usa normalmente          │
│ ou acessa via celular    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Ao fechar a aba/browser  │
│ ou ficar inativo         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Servidor desliga         │
│ automaticamente          │
└──────────────────────────┘
```

---

## 📱 ACESSO REMOTO

Se quiser acessar de **fora da rede WiFi**:
- Você precisará abrir a porta 5173 no roteador (Port Forwarding)
- Então acesse: `http://seu-ip-publico:5173`
- **Cuidado:** Isso expõe seu servidor na internet

Para **uso interno apenas**, recomendo:
- Deixar sem Port Forwarding
- Usar apenas na mesma rede WiFi

---

## 🛠️ TROUBLESHOOTING

### Problema: VBS diz "erro na linha X"
**Solução:** Verifique se a pasta "node_modules" existe. Se não, abra cmd aqui e execute:
```
npm install
npm run build
```

### Problema: Porta 5173 já está em uso
**Solução:** No arquivo `server.js`, mude a linha:
```javascript
const PORT = process.env.PORT || 5173;
```
Para:
```javascript
const PORT = process.env.PORT || 5174; // ou qualquer outra porta
```

### Problema: Celular não consegue acessar
**Solução:**
1. Verifique se estão na mesma rede WiFi
2. Verifique o IP correto com `ipconfig`
3. Verifique se o Firewall do Windows está bloqueando (libere a porta 5173)

---

## 📊 ARQUIVOS MODIFICADOS

- ✅ `iniciar_oculto.vbs` - Novo! Executa oculto
- ✅ `iniciar_completo.bat` - Novo! Script auxiliar
- ✅ `server.js` - Novo! Servidor com health check
- ✅ `server-start.bat` - Novo! Para iniciar modo produção
- ✅ `index.html` - Atualizado! Health check + detecção de fechamento
- ✅ `package.json` - Atualizado! Express + script server

---

## 🎯 RESUMO EXECUTIVO

| Requisito | Solução | Como usar |
|-----------|---------|-----------|
| CMD Oculto | Script VBS | Duplo clique em `iniciar_oculto.vbs` |
| Fechamento Auto | Server com health check | Automático ao fechar aba |
| Mobile (Android/iPhone) | Navegador responsivo + IP da rede | Acesse `http://IP:5173` no celular |

---

**Desenvolvido para:** SPE Jardim Luz - Gerenciamento de Obra
**Data:** 2026
