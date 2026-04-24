<<<<<<< HEAD
# Carregamento Automático de Arquivos Excel

## Como funciona

1. **Coloque seus arquivos Excel na mesma pasta do arquivo `iniciar.bat`**
   - Os arquivos devem ter os nomes padrão (ou similares):
     - `financeiro.xlsx`
     - `evolucao.xlsx`
     - `vendas-espelho.xlsx`
     - `vendas-inadimplentes.xlsx`
     - `pls.xlsx`

2. **Execute o arquivo `iniciar.bat`**
   - O script irá automaticamente:
     - Copiar os arquivos Excel para `public/data/`
     - Criar um arquivo `config.json` com a lista de arquivos
     - Iniciar o servidor de desenvolvimento
     - Abrir o navegador

3. **Os arquivos serão carregados automaticamente**
   - Quando a página carrega, o React detecta os arquivos em `public/data/`
   - Carrega todos os arquivos Excel automaticamente
   - O dashboard é preenchido com os dados

## Estrutura esperada

```
meu-dashboard/
├── src/
├── public/
│   └── data/          ← Os arquivos irão aqui
├── iniciar.bat        ← Execute este arquivo
├── financeiro.xlsx    ← Coloque aqui junto ao .bat
├── evolucao.xlsx
├── vendas-espelho.xlsx
├── vendas-inadimplentes.xlsx
└── pls.xlsx
```

## Se os arquivos não carregarem

Se por algum motivo os arquivos não carregarem automaticamente:
1. Pressione **F12** para abrir o console do navegador
2. Verifique se há mensagens de erro
3. Você ainda pode fazer upload manual usando a interface web

## Nomes alternativos de arquivos

Se seus arquivos tiverem nomes diferentes, você pode renomear conforme a lista acima, ou o script tentará encontrar arquivos que contenham as palavras-chave:
- "financeiro"
- "evolucao"
- "vendas-espelho"
- "vendas-inadimplentes"
- "pls"
=======
# Carregamento Automático de Arquivos Excel

## Como funciona

1. **Coloque seus arquivos Excel na mesma pasta do arquivo `iniciar.bat`**
   - Os arquivos devem ter os nomes padrão (ou similares):
     - `financeiro.xlsx`
     - `evolucao.xlsx`
     - `vendas-espelho.xlsx`
     - `vendas-inadimplentes.xlsx`
     - `pls.xlsx`

2. **Execute o arquivo `iniciar.bat`**
   - O script irá automaticamente:
     - Copiar os arquivos Excel para `public/data/`
     - Criar um arquivo `config.json` com a lista de arquivos
     - Iniciar o servidor de desenvolvimento
     - Abrir o navegador

3. **Os arquivos serão carregados automaticamente**
   - Quando a página carrega, o React detecta os arquivos em `public/data/`
   - Carrega todos os arquivos Excel automaticamente
   - O dashboard é preenchido com os dados

## Estrutura esperada

```
meu-dashboard/
├── src/
├── public/
│   └── data/          ← Os arquivos irão aqui
├── iniciar.bat        ← Execute este arquivo
├── financeiro.xlsx    ← Coloque aqui junto ao .bat
├── evolucao.xlsx
├── vendas-espelho.xlsx
├── vendas-inadimplentes.xlsx
└── pls.xlsx
```

## Se os arquivos não carregarem

Se por algum motivo os arquivos não carregarem automaticamente:
1. Pressione **F12** para abrir o console do navegador
2. Verifique se há mensagens de erro
3. Você ainda pode fazer upload manual usando a interface web

## Nomes alternativos de arquivos

Se seus arquivos tiverem nomes diferentes, você pode renomear conforme a lista acima, ou o script tentará encontrar arquivos que contenham as palavras-chave:
- "financeiro"
- "evolucao"
- "vendas-espelho"
- "vendas-inadimplentes"
- "pls"
>>>>>>> a307d3e394a9c71586f20b55de19704c0e651fc6
