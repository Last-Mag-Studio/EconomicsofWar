wss.on('connection', (ws) => {
    connections++;
    const clientId = uuidv4();
    clientPlayTimes[clientId] = clientPlayTimes[clientId] || 0;

    // Log the client ID to the server console
    console.log(`Client connected with ID: ${clientId}`);

    ws.send(JSON.stringify({ type: 'clientId', data: clientId }));

    ws.clients.forEach(client => {
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
        ws.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'connections', data: connections }));
            }
        });
    });
});