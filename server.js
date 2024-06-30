const express = require('express');
const { Server } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast the message to all clients except the sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});