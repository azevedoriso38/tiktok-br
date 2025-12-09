// ---------------------------
// IMPORTAÇÕES
// ---------------------------
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Porta dinâmica do Render ou 8080 localmente
const PORT = process.env.PORT || 8080;

// ---------------------------
// SERVIDOR HTTP (serve arquivos estáticos)
// ---------------------------
const server = http.createServer((req, res) => {
    let filePath = "." + req.url;

    if (filePath === "./") filePath = "./index.html";

    const ext = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg"
    };
    const contentType = mimeTypes[ext] || "text/plain";

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end("Arquivo não encontrado");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
    });
});

// ---------------------------
// WEBSOCKET
// ---------------------------
const wss = new WebSocket.Server({ server });

// ---------------------------
// FUNÇÕES DE USUÁRIO
// ---------------------------
function loadUsers() {
    if (!fs.existsSync("users.json")) {
        fs.writeFileSync("users.json", JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync("users.json"));
}

function saveUsers(users) {
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// ---------------------------
// LOGIC DE WEBSOCKET
// ---------------------------
wss.on("connection", ws => {
    console.log("Cliente conectado via WebSocket!");

    ws.on("message", message => {
        const data = JSON.parse(message);

        // ----------------- CADASTRO -----------------
        if (data.type === "register") {
            let users = loadUsers();

            if (users.some(u => u.username === data.username)) {
                ws.send(JSON.stringify({
                    type: "register_response",
                    success: false,
                    message: "Nome de usuário já existe!"
                }));
                return;
            }

            users.push({
                username: data.username,
                password: data.password,
                avatar: "default.png"
            });

            saveUsers(users);

            ws.send(JSON.stringify({
                type: "register_response",
                success: true,
                message: "Cadastro realizado com sucesso!"
            }));
        }

        // ----------------- LOGIN -----------------
        if (data.type === "login") {
            let users = loadUsers();

            const user = users.find(u => u.username === data.username && u.password === data.password);

            if (user) {
                ws.send(JSON.stringify({
                    type: "login_response",
                    success: true
                }));
            } else {
                ws.send(JSON.stringify({
                    type: "login_response",
                    success: false,
                    message: "Usuário ou senha incorretos!"
                }));
            }
        }

        // ----------------- GET PROFILE -----------------
        if (data.type === "get_profile") {
            let users = loadUsers();
            const user = users.find(u => u.username === data.username);
            if (user) {
                ws.send(JSON.stringify({
                    type: "profile_data",
                    username: user.username,
                    avatar: user.avatar || "default.png"
                }));
            }
        }

        // ----------------- UPDATE PROFILE -----------------
        if (data.type === "update_profile") {
            let users = loadUsers();
            const userIndex = users.findIndex(u => u.username === data.username);

            if (userIndex === -1) {
                ws.send(JSON.stringify({
                    type: "update_profile_response",
                    success: false,
                    message: "Usuário não encontrado"
                }));
                return;
            }

            // Atualiza nome de usuário
            if (data.newUsername) {
                if (users.some((u, i) => u.username === data.newUsername && i !== userIndex)) {
                    ws.send(JSON.stringify({
                        type: "update_profile_response",
                        success: false,
                        message: "Nome de usuário já existe"
                    }));
                    return;
                }
                users[userIndex].username = data.newUsername;
            }

            // Atualiza avatar
            if (data.avatarData) {
                const base64Data = data.avatarData.replace(/^data:image\/png;base64,/, "")
                                                  .replace(/^data:image\/jpeg;base64,/, "");
                const avatarFilename = `${users[userIndex].username}_avatar.png`;
                fs.writeFileSync(avatarFilename, base64Data, "base64");
                users[userIndex].avatar = avatarFilename;
            }

            saveUsers(users);

            ws.send(JSON.stringify({
                type: "update_profile_response",
                success: true,
                message: "Perfil atualizado com sucesso!",
                username: users[userIndex].username,
                avatar: users[userIndex].avatar
            }));
        }
    });
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
server.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
