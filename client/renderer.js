const ws = new WebSocket('ws://localhost:8447');
let totalTimePlayed = 0;
let clientPlayTime = parseInt(localStorage.getItem('clientPlayTime')) || 0;
let clientId = null;

ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'requestTotalTimePlayed' }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'connections') {
        document.getElementById('connections').innerText = message.data;
    } else if (message.type === 'time') {
        document.getElementById('time').innerText = message.data;
    } else if (message.type === 'totalTimePlayed') {
        totalTimePlayed = Math.floor(message.data);
        updateTotalTimePlayedDisplay();
    } else if (message.type === 'clientId') {
        clientId = message.data;
    }
};

function updateTotalTimePlayedDisplay() {
    const hours = Math.floor(totalTimePlayed / 3600);
    const minutes = Math.floor((totalTimePlayed % 3600) / 60);
    const seconds = totalTimePlayed % 60;
    document.getElementById('totalTimePlayed').innerText = `${hours}h ${minutes}m ${seconds}s`;
}

function updateClientPlayTimeDisplay() {
    const hours = Math.floor(clientPlayTime / 3600);
    const minutes = Math.floor((clientPlayTime % 3600) / 60);
    const seconds = clientPlayTime % 60;
    document.getElementById('clientPlayTime').innerText = `${hours}h ${minutes}m ${seconds}s`;
}

async function updatePlayTimes() {
    totalTimePlayed++;
    clientPlayTime++;
    updateTotalTimePlayedDisplay();
    updateClientPlayTimeDisplay();
    localStorage.setItem('clientPlayTime', clientPlayTime);
    ws.send(JSON.stringify({ type: 'updateTotalTimePlayed', data: totalTimePlayed }));
    ws.send(JSON.stringify({ type: 'updateClientPlayTime', data: clientPlayTime, clientId: clientId }));
}

setInterval(updatePlayTimes, 1000);

const updateOnlineStatus = () => {
    document.getElementById('status').innerHTML = navigator.onLine ? 'online' : 'offline';
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

updateOnlineStatus();
updateClientPlayTimeDisplay();