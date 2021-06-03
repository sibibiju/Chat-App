const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(3001);
const io = socketio(expressServer);

io.on('connection', (socket) => {
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    });

    socket.emit('nsList', nsData);
});

namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const userName = nsSocket.handshake.query.username;

        console.log(`${nsSocket.id} has joined the namespace ${namespace.nsTitle}`);
        nsSocket.emit("nsRoomLoad", namespace.rooms);

        nsSocket.on("joinRoom", async(roomToJoin, numberOfUsersCB) => {

            const roomToLeave = Array.from(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            nsSocket.join(roomToJoin);

            //we need to find the number of users connected in the room
            let membersCount = await getMembersCount(namespace.endpoint, roomToJoin);
            numberOfUsersCB(membersCount);

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin
            });

            if (nsRoom) {
                console.log("emit chat history");
                nsSocket.emit("chatHistory", nsRoom.history);
            }

            membersCount = await getMembersCount(namespace.endpoint, roomToJoin);
            io.of(namespace.endpoint).to(roomToJoin).emit("updateMembers", {
                memberCount: membersCount,
                room: roomToJoin
            });
        });

        nsSocket.on("newMessageToServer", (msg) => {
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: userName,
                avatar: "https://via.placeholder.com/30"
            };

            //Get current room title
            let socketRooms = Array.from(nsSocket.rooms);
            const roomTitle = socketRooms[socketRooms.length - 1];
            console.log("socket rooms TITLE", roomTitle);

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle
            });

            if (nsRoom) {
                nsRoom.addMessage(fullMsg);
                io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)
            }
        });
    });
});

let getMembersCount = async(namespace, room) => {
    const clients = await io.of(namespace).in(room).allSockets();
    const clientsArr = Array.from(clients);
    const members = clientsArr.length;
    return members;
}