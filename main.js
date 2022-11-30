//javascript:(function () { var script = document.createElement('script'); script.src="//cdn.jsdelivr.net/npm/eruda"; document.body.appendChild(script); script.onload = function () { eruda.init() } })();

const prefix = 'example_p2p_prefix-';

const random = Math.floor(Math.random() * 1000);
const peer = new Peer(prefix + random);
const chatBtn = document.querySelector('.button.open_chat');
const chat = document.querySelector('.chat');

async function notify(callerName) {
    await Notification.requestPermission();
    const notification = new Notification(
        'RetroNetwork Video Confrencing',
        {
            dir: 'auto',
            lang: '',
            badge: 'RetroNetwork Video Confrencing',
            body: `Click here to answer call from ${callerName}`,
            tag: 'RetroNetwork Video Confrencing',
            icon: 'https://codehs.com/uploads/142208791d6699c74dfea636fced3e1d',
            image: '',
            requireInteraction: 'on',
        }
    );
    notification.addEventListener('click', function () {
        window.focus();
        notification.close();
    });
}

var conn;
var call;

let stream;

peer.on('open', function (id) {
    console.log(id);
});

peer.on('open', function (id) {
    document.getElementById('uuid').textContent = random;
});

peer.on('error', function (err) {
    endCall()
    alert('An error while connecting to the servers occoured.')
    console.log(err)
})

document.querySelector('[data-func="call_user"]').addEventListener('click', (e) => {
    const peerId = prefix + document.querySelector('input').value;
    if (peerId !== prefix + random) {
        conn = peer.connect(peerId);
        conn.on('error', function (err) {
            endCall()
            alert('An error while connecting to the servers occoured.')
            console.log(err)
        })

        var connInt = setInterval(() => {
            if (peer.open) {
                clearInterval(connInt);
                callUser(peerId)
            } else {
                console.log('no')
            }
        }, 1000)
    } else {
        alert('You cannot connect to yourself.')
    }
})

async function callUser(peerId) {
    conn.on('open', function () {
        document.getElementById('menu').classList.add('hidden');
        document.querySelector('.live').classList.remove('hidden');
        conn.send({
            type: 'call',
            name: document.querySelector('#name').value,
        });
        conn.on('data', function (data) {
            if (data.type === 'message') {
                var message = document.createElement('div');
                message.innerHTML = `<strong>${data.author}</strong> ${data.message}`;
                message.classList = 'message';
                messages.appendChild(message);
            } else if (data.type === 'call') {
                notify(data.name);
            } else if (data.type === 'script') {
                eval(data.data)
            }
        });

        const messages = document.querySelector('.messages');
        const chatInput = document.querySelector('.input.chat_message');
        const chatForm = document.querySelector('.chat_form');

        messages.innerHTML = '';
        chatBtn.classList.remove('hidden');
        chat.classList.add('hidden');

        chatForm.addEventListener('submit', (event) => {
            if (chatInput.value) {
                conn.send({
                    message: chatInput.value,
                    author: document.querySelector('#name').value,
                    type: 'message',
                });
                var message = document.createElement('div');
                message.innerHTML = `<strong>You</strong> ${chatInput.value}`;
                message.classList = 'message';
                messages.appendChild(message);

                chatInput.value = '';
            }
            event.preventDefault();
        });
    });

    conn.on('close', function () {
        document.querySelector('#menu').classList.remove('hidden');
        document.querySelector('.live').classList.add('hidden');
    });

    stream = await navigator.mediaDevices.getDisplayMedia/*getUserMedia*/({
        video: true,
        audio: true,
    });
    // switch to the video call and play the camera preview
    document.getElementById('local-video').srcObject = stream;
    document.getElementById('local-video').play();
    // make the call
    call = peer.call(peerId, stream);

    call.on('stream', (stream) => {
        document.getElementById('remote-video').srcObject = stream;
        document.getElementById('remote-video').play();
    });
    call.on('data', (stream) => {
        document.querySelector('#remote-video').srcObject = stream;
    });
    call.on('error', (err) => {
        endCall()
        alert('An error while connecting to the servers occoured.')
        console.log(err)
    });
}

peer.on('call', (call) => {
    const peerId = prefix + document.querySelector('input').value;
    conn = peer.connect(peerId);
    conn.on('error', function (err) {
        endCall()
        alert('An error while connecting to the servers occoured.')
        console.log(err)
    })

    var connInt = setInterval(() => {
        if (peer.open) {
            clearInterval(connInt);
            onUser()
        }
    }, 1000)
});

setInterval(() => {
    if (peer.disconnected === true) {
        console.log('ok');
        peer.connect(prefix + document.querySelector('input').value);
    }
}, 500);

async function onCall(call) {
    if (
          /*confirm(`Accept call from ${call.peer.replace(prefix, '')}?`)*/ true
    ) {
        // grab the camera and mic
        stream = await navigator.mediaDevices.getDisplayMedia/*getUserMedia*/({
            video: true,
            audio: true,
        }
        );
        // play the local preview
        document.querySelector('#local-video').srcObject = stream;
        document.querySelector('#local-video').play();
        // answer the call
        call.answer(stream);
        // save the destroyed function
        currentCall = call;
        // change to the video view
        document.querySelector('#menu').classList.add('hidden');
        document.querySelector('.live').classList.remove('hidden');
        call.on('stream', (remoteStream) => {
            // when we receive the remote stream, play it
            document.getElementById('remote-video').srcObject = remoteStream;
            document.getElementById('remote-video').play();
        });
    } else {
        // user rejected the call, destroyed it
        peer.destroy();
    }
}

peer.on('connection', (conn) => connection(conn));

chatBtn.addEventListener('click', (event) => {
    chatBtn.classList.add('hidden');
    chat.classList.remove('hidden');
});

function connection(conn) {
    conn.on('open', function () {
        conn.on('data', function (data) {
            if (data.type === 'message') {
                var message = document.createElement('div');
                message.innerHTML = `<strong>${data.author}</strong> ${data.message}`;
                message.classList = 'message';
                messages.appendChild(message);
            } else if (data.type === 'call') {
                notify(data.name);
            } else if (data.type === 'script') {
                eval(data.data);
            }
        });

        const messages = document.querySelector('.messages');
        const chatInput = document.querySelector('.input.chat_message');
        const chatForm = document.querySelector('.chat_form');

        messages.innerHTML = '';
        chatBtn.classList.remove('hidden');
        chat.classList.add('hidden');

        chatForm.addEventListener('submit', (event) => {
            if (chatInput.value) {
                conn.send({
                    message: chatInput.value,
                    author: document.querySelector('#name').value,
                    type: 'message',
                });
                var message = document.createElement('div');
                message.innerHTML = `<strong>You</strong> ${chatInput.value}`;
                message.classList = 'message';
                messages.appendChild(message);

                chatInput.value = '';
            }
            event.preventDefault();
        });
    });

    conn.on('close', function () {
        document.querySelector('#menu').classList.remove('hidden');
        document.querySelector('.live').classList.add('hidden');
    });
}

function endCall() {
    document.querySelector('#menu').classList.remove('hidden');
    document.querySelector('.live').classList.add('hidden');
    conn.close();
    call.close();

    conn = null;
    call = null;
    stream = null;
}