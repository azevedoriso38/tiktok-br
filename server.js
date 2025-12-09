const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

// Carregar arquivo de usuários
function loadUsers() {
    if (!fs.existsSync('users.json')) {
        fs.writeFileSync('users.json', JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync('users.json'));
}

// Salvar usuários
function saveUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

wss.on('connection', ws => {
    console.log("Cliente conectado");

    ws.on('message', message => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            let users = loadUsers();

            // Verifica duplicidade
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

console.log("Servidor WebSocket rodando na porta 8080");
