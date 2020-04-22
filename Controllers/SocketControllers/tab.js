const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");
const axios = require("axios");

// Model
const Tab = require("../../Models/tab");

exports.createTab = (data, io, socket, roomCreated) => {
    // encrypt tabname
    const cryptdRoom = Base64.stringify(Utf8.parse(`${data.name}-${data.username}`));

    socket.join(cryptdRoom);

    roomCreated[cryptdRoom] = io.sockets.adapter.rooms[cryptdRoom];
    roomCreated[cryptdRoom].owner = { "userID": data.userID, "username": data.username };
    roomCreated[cryptdRoom].invitationLink = `${cryptdRoom}`;
    roomCreated[cryptdRoom]._id = data.id;
    roomCreated[cryptdRoom].guests = [];

    socket.emit("confirm creation", roomCreated[cryptdRoom]);
};

exports.joinTab = async (data, io, socket, roomCreated) => {
    const { link, friendTabId, userData } = data;

    if (!roomCreated[link] || typeof roomCreated[link] === "undefined") {
        return socket.emit("join error", { "errors": "La table que vous essayiez de rejoindre n'existe pas" });
    }

    socket.join(link);

    const tab = await Tab.findOne({ "_id": friendTabId });

    roomCreated[link].guests = [...roomCreated[link].guests, userData];

    socket.emit("tab joined", { "socket": roomCreated[link], "tabData": tab });

    io.to(link).emit("user joined room", { "message": `${userData.username} a rejoint votre tableau !`, "userData": { ...userData, "socketId": socket.id } });

    console.log(socket.id);

};
