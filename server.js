wss.on("connection", ws => {
    console.log("Cliente conectado via WebSocket!");

    ws.on("message", message => {
        const data = JSON.parse(message);

        // CADASTRO
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
                password: data.password
            });

            saveUsers(users);

            ws.send(JSON.stringify({
                type: "register_response",
                success: true,
                message: "Cadastro realizado com sucesso!"
            }));
        }

        // LOGIN
        if (data.type === "login") {
            let users = loadUsers();

            const user = users.find(u => 
                u.username === data.username &&
                u.password === data.password
            );

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
    });
});
