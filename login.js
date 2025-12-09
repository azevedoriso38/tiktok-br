const socket = new WebSocket("wss://" + window.location.host);

socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket para login!");
};

socket.onmessage = msg => {
    const data = JSON.parse(msg.data);
    const msgEl = document.getElementById("msg");

    if (data.type === "login_response") {
        if (data.success) {
            msgEl.style.color = "green";
            msgEl.innerText = "Login realizado!";

            // Redireciona para a tela de vídeos
            setTimeout(() => {
                window.location.href = "videos.html";
            }, 500);

        } else {
            msgEl.style.color = "red";
            msgEl.innerText = data.message;
        }
    }
};

function entrar() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    socket.send(JSON.stringify({
        type: "login",
        username,
        password
    }));
}
