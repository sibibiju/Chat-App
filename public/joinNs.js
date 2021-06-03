const joinNs = (endpoint) => {

    if (nsSocket) {
        nsSocket.close();
        document.querySelector("#user-input").removeEventListener('submit', formSubmit);
    }


    nsSocket = io(`http://localhost:3001${endpoint}`);

    nsSocket.on('nsRoomLoad', (nsRooms) => {
        let roomList = document.querySelector(".room-list");
        roomList.innerHTML = "";

        nsRooms.forEach((room) => {
            let glyph = "";
            if (room.privateRoom) {
                glyph = "lock";
            } else {
                glyph = "globe";
            }
            roomList.innerHTML += `<li class="room" style="display: flex"><span class="glyphicon glyphicon-${glyph}"></span><div class="roomTitle">${room.roomTitle}</div></li>`;
        });

        let roomNodes = document.getElementsByClassName("roomTitle");
        Array.from(roomNodes).forEach((elm) => {
            elm.addEventListener("click", (e) => {
                joinRoom(e.target.innerHTML);
                //console.log(`clicked on `, e.target.innerHTML);
            });
        });


        // let topRoom = document.querySelector('.room');
        // let roomName = topRoom.innerText;
        let topRoomName = nsRooms[0].roomTitle;
        console.log("topRoomName", topRoomName);
        joinRoom(topRoomName);

        //console.log(nsRooms);
    });

    nsSocket.on("messageToClients", (msg) => {
        console.log("messageToClients", msg);

        let html = buildHTML(msg);
        document.querySelector("#messages").innerHTML += html;
    });

    document.querySelector(".message-form").addEventListener("submit", formSubmit);

    nsSocket.on("chatHistory", (history) => {
        console.log("chatHistory", history);
        const messagesUi = document.querySelector("#messages");
        messagesUi.innerHTML = "";
        for (chat of history) {
            let html = buildHTML(chat);
            messagesUi.innerHTML += html;
        }
        //To show recent messages
        messagesUi.scrollTo(0, messagesUi.scrollHeight);
    });

    nsSocket.on("updateMembers", (data) => {
        document.querySelector(".curr-room-num-users").innerHTML = `${data.memberCount} <span class="glyphicon glyphicon-user"></span>`;
        document.querySelector(".curr-room-text").innerHTML = `${data.room}`;
    })
}

let formSubmit = (event) => {
    event.preventDefault();
    let newMessage = document.querySelector("#user-message").value;
    nsSocket.emit("newMessageToServer", { "text": newMessage });
}

let buildHTML = (msg) => {
    const time = new Date(msg.time).toLocaleString();
    html = `
            <li>
                <div class="user-image">
                    <img src="${msg.avatar}" />
                </div>
                <div class="user-message">
                    <div class="user-name-time">${msg.username} <span>${time}</span></div>
                    <div class="message-text">${msg.text}</div>
                </div>
            </li>
        `;

    return html;
}