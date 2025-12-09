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
