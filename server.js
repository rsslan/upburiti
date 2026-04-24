<<<<<<< HEAD
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(express.static('dist'));
app.use(express.json());

// Variável para rastrear conexões ativas
let lastClientActivity = Date.now();
let clientConnected = false;

// Health check endpoint - permite que o cliente se comunique com o servidor
app.post('/api/health', (req, res) => {
    lastClientActivity = Date.now();
    clientConnected = true;
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint para registrar que o cliente está desconectando
app.post('/api/shutdown', (req, res) => {
    res.json({ status: 'shutting down' });
    setTimeout(() => {
        console.log('Cliente desconectou. Encerrando servidor...');
        process.exit(0);
    }, 500);
});

// Serve index.html para rotas que não existem (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✓ Acesso remoto em http://<seu-ip>:${PORT}`);
    console.log('? Pressione Ctrl+C para parar\n');
});

// Monitora inatividade (se cliente não enviar health check por 5 minutos)
setInterval(() => {
    const inactiveTime = Date.now() - lastClientActivity;
    if (clientConnected && inactiveTime > 5 * 60 * 1000) {
        console.log('Nenhuma atividade por 5 minutos. Encerrando servidor...');
        process.exit(0);
    }
}, 30000); // Verifica a cada 30 segundos

=======
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(express.static('dist'));
app.use(express.json());

// Variável para rastrear conexões ativas
let lastClientActivity = Date.now();
let clientConnected = false;

// Health check endpoint - permite que o cliente se comunique com o servidor
app.post('/api/health', (req, res) => {
    lastClientActivity = Date.now();
    clientConnected = true;
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint para registrar que o cliente está desconectando
app.post('/api/shutdown', (req, res) => {
    res.json({ status: 'shutting down' });
    setTimeout(() => {
        console.log('Cliente desconectou. Encerrando servidor...');
        process.exit(0);
    }, 500);
});

// Serve index.html para rotas que não existem (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✓ Acesso remoto em http://<seu-ip>:${PORT}`);
    console.log('? Pressione Ctrl+C para parar\n');
});

// Monitora inatividade (se cliente não enviar health check por 5 minutos)
setInterval(() => {
    const inactiveTime = Date.now() - lastClientActivity;
    if (clientConnected && inactiveTime > 5 * 60 * 1000) {
        console.log('Nenhuma atividade por 5 minutos. Encerrando servidor...');
        process.exit(0);
    }
}, 30000); // Verifica a cada 30 segundos

>>>>>>> a307d3e394a9c71586f20b55de19704c0e651fc6
