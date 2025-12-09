const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Servidor WebSocket está rodando");
});

const wss = new WebSocket.Server({ server });

// Funções de carregar e salvar usuários
function loadUsers() {
    if (!fs.existsSync('users.json')) {
        fs.writeFileSync('users.json', JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync('users.json'));
}

function saveUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// WebSocket
wss.on('connection', ws => {
    console.log("Cliente conectado");

    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            let users = loadUsers();

            if (users.some(u => u.username === data.username)) {
                ws.send(JSON.stringify({
                    type: 'register_response',
                    success: false,
                    message: "Nome de usuário já existe!"
                }));
                return;
            }

            users.push({ username: data.username, password: data.password });
            saveUsers(users);

            ws.send(JSON.stringify({
                type: 'register_response',
                success: true,
                message: "Cadastro realizado com sucesso!"
            }));
        }
    });
});

server.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
