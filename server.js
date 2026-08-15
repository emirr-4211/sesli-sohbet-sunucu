const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 10000;
const wss = new WebSocketServer({ port: PORT });

function broadcastUserList() {
    const users = [];
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client.username) {
            users.push(client.username);
        }
    });
    const payload = JSON.stringify({ type: 'userlist', users });
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(payload);
        }
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (data, isBinary) => {
        if (isBinary) {
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                    client.send(data, { binary: true });
                }
            });
        } else {
            try {
                const msg = data.toString();
                if (msg.startsWith('JOIN:')) {
                    ws.username = msg.replace('JOIN:', '').trim();
                    broadcastUserList();
                }
            } catch (e) {}
        }
    });

    ws.on('close', () => {
        broadcastUserList();
    });
});

console.log(`Sunucu ${PORT} portunda aktif.`);