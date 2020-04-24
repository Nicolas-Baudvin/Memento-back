const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");

// Model
const Tab = require("../../Models/tab");

exports.createTab = async (data, io, socket, roomCreated) => {
    const tab = await Tab.findOne({ "_id": data.id });

    if (!tab) {
        return socket.emit("create error", { "errors": "La table que vous tentez de créer n'existe pas !", "redirect": true });
    }
    if (tab.userID !== data.userID) {
        return socket.emit("create error", { "errors": "Cette table ne vous appartient pas.", "redirect": true });
    }
    // encrypt tabname
    const cryptdRoom = Base64.stringify(Utf8.parse(`${data.name}-${data.username}`));

    socket.join(cryptdRoom);

    roomCreated[cryptdRoom] = io.sockets.adapter.rooms[cryptdRoom];
    roomCreated[cryptdRoom].owner = { "userID": data.userID, "username": data.username };
    roomCreated[cryptdRoom].invitationLink = `${cryptdRoom}`;
    roomCreated[cryptdRoom]._id = data.id;
    roomCreated[cryptdRoom].guests = [];
    roomCreated[cryptdRoom].tab = tab;

    socket.emit("confirm creation", roomCreated[cryptdRoom]);
};

exports.joinTab = async (data, io, socket, roomCreated) => {
    const { link, friendTabId, userData } = data;

    if (!roomCreated[link] || typeof roomCreated[link] === "undefined") {
        return socket.emit("join error", { "errors": "La table que vous essayiez de rejoindre n'existe pas" });
    }

    socket.join(link);

    const tab = await Tab.findOne({ "_id": friendTabId });

    roomCreated[link].guests = [...roomCreated[link].guests, { "userData": { ...userData, "socketId": socket.id } }];

    socket.emit("tab joined", { "socket": roomCreated[link], "tabData": tab });

    io.to(link).emit("user joined room", { "message": `${userData.username} a rejoint votre tableau !`, "userData": { ...userData, "socketId": socket.id }, "currentSocket": roomCreated[link] });

    console.log(socket.id);

};

exports.leaveRoom = (room, io, socket, roomCreated) => {
    console.log("Un utilisateur quitte le salon", room.name);

    const { name, userData } = room;

    roomCreated[name].guests = roomCreated[name].guests.filter((guest) => guest.userData.userID !== userData.userID);
    io.to(name).emit("user leave", { "message": `${userData.username} a quitté votre instance`, userData, "socketId": socket.id, "currentSocket": roomCreated[name] });

    socket.leave(name);
    socket.disconnect();
};
