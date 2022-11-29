const prefix = "example_p2p_prefix-";

const random = Math.floor(Math.random() * 1000);
const peer = new Peer(prefix + random);
const chatBtn = document.querySelector(".button.open_chat");
const chat = document.querySelector(".chat");

async function notify(callerName) {
    await Notification.requestPermission();
    const notification = new Notification(
        "RetroNetwork Video Confrencing",
        {
            dir: "auto",
            lang: "",
            badge:
                "https://f9928793-06ce-4c41-ad0a-5558a1cd061a-4606328.codehs.me/assets/pages/vc",
            body: `Click here to answer call from ${callerName}`,
            tag: "RetroNetwork Video Confrencing",
            icon: "https://codehs.com/uploads/142208791d6699c74dfea636fced3e1d",
            image: "",
            requireInteraction: "on",
        }
    );
    notification.addEventListener("click", function () {
        window.focus();
        notification.close();
    });
}

var conn;
var call;

let stream;

peer.on("open", function (id) {
    console.log(id);
});

peer.on("open", function (id) {
    document.getElementById("uuid").textContent = random;
});

async function callUser() {
    // get the id entered by the user
    const peerId = prefix + document.querySelector("input").value;
    // grab the camera and mic
    stream = await navigator.mediaDevices./*getDisplayMedia*/getUserMedia({
        video: true,
        audio: true,
    }
    );
    // switch to the video call and play the camera preview
    document.getElementById("menu").classList.add("hidden");
    document.querySelector(".live").classList.remove("hidden");
    document.getElementById("local-video").srcObject = stream;
    document.getElementById("local-video").play();
    // make the call
    call = peer.call(peerId, stream);

    conn = peer.connect(peerId);
    conn.on("open", function () {
        conn.send({
            type: "call",
            name: document.querySelector("#name").value,
        });
        conn.on("data", function (data) {
            if (data.type === "message") {
                var message = document.createElement("div");
                message.innerHTML = `<strong>${data.author}</strong> ${data.message}`;
                message.classList = "message";
                messages.appendChild(message);
            } else if (data.type === "call") {
                notify(data.name);
            }
        });

        const messages = document.querySelector(".messages");
        const chatInput = document.querySelector(".input.chat_message");
        const chatForm = document.querySelector(".chat_form");

        messages.innerHTML = "";
        chatBtn.classList.remove("hidden");
        chat.classList.add("hidden");

        chatForm.addEventListener("submit", (event) => {
            if (chatInput.value) {
                conn.send({
                    message: chatInput.value,
                    author: document.querySelector("#name").value,
                    type: "message",
                });
                var message = document.createElement("div");
                message.innerHTML = `<strong>You</strong> ${chatInput.value}`;
                message.classList = "message";
                messages.appendChild(message);

                chatInput.value = "";
            }
            event.preventDefault();
        });
    });

    conn.on("close", function () {
        document.querySelector("#menu").classList.remove("hidden");
        document.querySelector(".live").classList.add("hidden");
    });

    call.on("stream", (stream) => {
        document.getElementById("remote-video").srcObject = stream;
        document.getElementById("remote-video").play();
    });
    call.on("data", (stream) => {
        document.querySelector("#remote-video").srcObject = stream;
    });
    call.on("error", (err) => {
        console.log(err);
    });
    currentCall = call;
    // save the destroyed function
}

peer.on("call", (call) => onCall(call));

setInterval(() => {
    if (peer.disconnected === true) {
        console.log("ok");
        peer.connect(prefix + document.querySelector("input").value);
    }
}, 500);

async function onCall(call) {
    if (
          /*confirm(`Accept call from ${call.peer.replace(prefix, '')}?`)*/ true
    ) {
        // grab the camera and mic
        stream = await navigator.mediaDevices./*getDisplayMedia*/getUserMedia({
            video: true,
            audio: true,
        }
        );
        // play the local preview
        document.querySelector("#local-video").srcObject = stream;
        document.querySelector("#local-video").play();
        // answer the call
        call.answer(stream);
        // save the destroyed function
        currentCall = call;
        // change to the video view
        document.querySelector("#menu").classList.add("hidden");
        document.querySelector(".live").classList.remove("hidden");
        call.on("stream", (remoteStream) => {
            // when we receive the remote stream, play it
            document.getElementById("remote-video").srcObject = remoteStream;
            document.getElementById("remote-video").play();
        });
    } else {
        // user rejected the call, destroyed it
        peer.destroy();
    }
}

peer.on("connection", (conn) => connection(conn));

chatBtn.addEventListener("click", (event) => {
    chatBtn.classList.add("hidden");
    chat.classList.remove("hidden");
});

function connection(conn) {
    conn.on("open", function () {
        conn.on("data", function (data) {
            if (data.type === "message") {
                var message = document.createElement("div");
                message.innerHTML = `<strong>${data.author}</strong> ${data.message}`;
                message.classList = "message";
                messages.appendChild(message);
            } else if (data.type === "call") {
                notify(data.name);
            }
        });

        const messages = document.querySelector(".messages");
        const chatInput = document.querySelector(".input.chat_message");
        const chatForm = document.querySelector(".chat_form");

        messages.innerHTML = "";
        chatBtn.classList.remove("hidden");
        chat.classList.add("hidden");

        chatForm.addEventListener("submit", (event) => {
            if (chatInput.value) {
                conn.send({
                    message: chatInput.value,
                    author: document.querySelector("#name").value,
                    type: "message",
                });
                var message = document.createElement("div");
                message.innerHTML = `<strong>You</strong> ${chatInput.value}`;
                message.classList = "message";
                messages.appendChild(message);

                chatInput.value = "";
            }
            event.preventDefault();
        });
    });

    conn.on("close", function () {
        document.querySelector("#menu").classList.remove("hidden");
        document.querySelector(".live").classList.add("hidden");
    });
}

function endCall() {
    document.querySelector("#menu").classList.remove("hidden");
    document.querySelector(".live").classList.add("hidden");
    conn.close();
    call.close();

    conn = null;
    call = null;
    stream = null;
}