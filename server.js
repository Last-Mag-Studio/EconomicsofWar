const WebSocket = require('ws');

const wss = new WebSocket.Server({ host: '66.179.252.151', port: 8447 });
let connections = 0;

wss.on('connection', (ws) => {
    connections++;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'connections', data: connections }));
        }
    });

    ws.on('close', () => {
        connections--;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'connections', data: connections }));
            }
        });
    });
});

console.log('WebSocket server is running on ws://66.179.252.151:8447');