const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");
const axios = require("axios");

// Model
const Tab = require("../../Models/tab");

exports.createTab = (data, io, socket, roomCreated) => {
    console.log("Création d'une nouvelle table Online en cours...", data);
    // encrypt tabname
    const cryptdRoom = Base64.stringify(Utf8.parse(`${data.name}-${data.username}`));
    const decrptRoom = Utf8.stringify(Base64.parse(cryptdRoom));
    const date = new Date();

    socket.join(cryptdRoom);

    roomCreated[cryptdRoom] = io.sockets.adapter.rooms[cryptdRoom];
    roomCreated[cryptdRoom].owner = { "userID": data.userID, "username": data.username };
    roomCreated[cryptdRoom].invitationLink = `${cryptdRoom}`;

    console.log("Création confirmée...", roomCreated[cryptdRoom]);

    socket.emit("confirm creation", roomCreated[cryptdRoom]);

    console.log("Le réseau compote désormais ", roomCreated);
};
