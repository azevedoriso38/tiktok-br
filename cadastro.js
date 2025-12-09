const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("Conectado ao servidor");
};

socket.onmessage = msg => {
    const data = JSON.parse(msg.data);

    if (data.type === 'register_response') {
        const msgEl = document.getElementById("msg");
        msgEl.innerText = data.message;
        msgEl.style.color = data.success ? "green" : "red";
    }
};

function cadastrar() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    socket.send(JSON.stringify({
        type: "register",
        username,
        password
    }));
}
