const fs = require('fs');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ host: '66.179.252.151', port: 8447 });
let connections = 0;
let totalTimePlayed = 0;

// Read totalTimePlayed from file
const filePath = 'totalTimePlayed.txt';
if (fs.existsSync(filePath)) {
    totalTimePlayed = parseFloat(fs.readFileSync(filePath, 'utf8')) || 0;
}

wss.on('connection', (ws) => {
    connections++;
    const connectionStartTime = Date.now();

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'connections', data: connections }));
        }
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'requestTotalTimePlayed') {
            ws.send(JSON.stringify({ type: 'totalTimePlayed', data: totalTimePlayed }));
        }
    });

    ws.on('close', () => {
        connections--;
        const connectionEndTime = Date.now();
        totalTimePlayed += (connectionEndTime - connectionStartTime) / 1000; // convert to seconds

        // Write totalTimePlayed to file
        fs.writeFileSync(filePath, totalTimePlayed.toString());

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'connections', data: connections }));
                client.send(JSON.stringify({ type: 'totalTimePlayed', data: totalTimePlayed }));
            }
        });
    });
});

setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'time', data: currentTime }));
        }
    });
}, 1000); // 1000 ms = 1 second

console.log('WebSocket server is running on ws://66.179.252.151:8447');