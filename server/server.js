const fs = require('fs');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ host: '66.179.252.151', port: 8447 });
let connections = 0;
let totalTimePlayed = 0;
const clientPlayTimes = {};

// Read totalTimePlayed from file
const totalTimePlayedFilePath = 'totalTimePlayed.txt';
if (fs.existsSync(totalTimePlayedFilePath)) {
    totalTimePlayed = parseFloat(fs.readFileSync(totalTimePlayedFilePath, 'utf8')) || 0;
}

// Read clientPlayTimes from file
const clientPlayTimesFilePath = 'clientPlayTimes.json';
if (fs.existsSync(clientPlayTimesFilePath)) {
    Object.assign(clientPlayTimes, JSON.parse(fs.readFileSync(clientPlayTimesFilePath, 'utf8')));
}

wss.on('connection', (ws) => {
    connections++;
    const clientId = uuidv4();
    clientPlayTimes[clientId] = clientPlayTimes[clientId] || 0;

    ws.send(JSON.stringify({ type: 'clientId', data: clientId }));

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'connections', data: connections }));
        }
    });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'requestTotalTimePlayed') {
            ws.send(JSON.stringify({ type: 'totalTimePlayed', data: totalTimePlayed }));
        } else if (parsedMessage.type === 'updateTotalTimePlayed') {
            totalTimePlayed = parsedMessage.data;
            fs.writeFileSync(totalTimePlayedFilePath, totalTimePlayed.toString());
        } else if (parsedMessage.type === 'updateClientPlayTime') {
            clientPlayTimes[clientId] = parsedMessage.data;
            fs.writeFileSync(clientPlayTimesFilePath, JSON.stringify(clientPlayTimes));
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

setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'time', data: currentTime }));
        }
    });
}, 1000);

console.log('WebSocket server is running on ws://localhost:8447');