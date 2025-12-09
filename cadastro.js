// WebSocket seguro (Render usa HTTPS)
const socket = new WebSocket("wss://" + window.location.host);

socket.onopen = () => {
    console.log("Conectado ao servidor WebSocket!");
};

socket.onmessage = msg => {
    const data = JSON.parse(msg.data);
    const msgEl = document.getElementById("msg");

    if (data.type === "register_response") {
        msgEl.innerText = data.message;
        msgEl.style.color = data.success ? "green" : "red";
    }
};

function cadastrar() {
    if (socket.readyState !== WebSocket.OPEN) {
        alert("Conexão com o servidor não está aberta!");
        return;
    }

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    socket.send(JSON.stringify({
        type: "register",
        username,
        password
    }));
}
