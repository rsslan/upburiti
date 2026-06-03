import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const distPath = path.join(__dirname, 'dist');

// Middleware
app.use(express.json());

// Servir arquivos estáticos com tipos MIME corretos
app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
            res.setHeader('Content-Type', 'font/woff2');
        } else if (filePath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        }
    }
}));

// Variável para rastrear conexões ativas
let lastClientActivity = Date.now();
let clientConnected = false;

// Health check endpoint
app.post('/api/health', (req, res) => {
    lastClientActivity = Date.now();
    clientConnected = true;
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint para shutdown
app.post('/api/shutdown', (req, res) => {
    res.json({ status: 'shutting down' });
    setTimeout(() => {
        console.log('Cliente desconectou. Encerrando servidor...');
        process.exit(0);
    }, 500);
});

// Serve index.html apenas para rotas SPA (sem extensão de arquivo)
app.get('*', (req, res) => {
    const requestPath = req.path;
    // Se não tem extensão, é uma rota SPA
    if (!path.extname(requestPath)) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).send('Not found');
    }
});

// Inicia o servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✓ Acesso remoto em http://<seu-ip>:${PORT}`);
    console.log('? Pressione Ctrl+C para parar\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nEncerrando servidor...');
    server.close();
    process.exit(0);
});

// Monitora inatividade (se cliente não enviar health check por 5 minutos)
setInterval(() => {
    const inactiveTime = Date.now() - lastClientActivity;
    if (clientConnected && inactiveTime > 5 * 60 * 1000) {
        console.log('Nenhuma atividade por 5 minutos. Encerrando servidor...');
        process.exit(0);
    }
}, 30000); // Verifica a cada 30 segundos

