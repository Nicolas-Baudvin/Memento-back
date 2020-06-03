const Base64 = require("crypto-js/enc-base64"),
    Utf8 = require("crypto-js/enc-utf8"),
    { cryptUserData } = require("../../Utils/crypt"),
    Message = require("../../Models/message");

// Model
const Tab = require("../../Models/tab");
const List = require("../../Models/list");
const Task = require("../../Models/task");

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

    if (!roomCreated[cryptdRoom]) {
        roomCreated[cryptdRoom] = io.sockets.adapter.rooms[cryptdRoom];
        roomCreated[cryptdRoom].owner = { "userID": data.userID, "username": data.username, "isOnline": true };
        roomCreated[cryptdRoom].invitationLink = `${cryptdRoom}`;
        roomCreated[cryptdRoom]._id = data.id;
        roomCreated[cryptdRoom].guests = [];
        roomCreated[cryptdRoom].tab = tab;
        roomCreated[cryptdRoom].operators = [];
    }

    socket.emit("confirm creation", roomCreated[cryptdRoom]);
};

exports.joinTab = async (data, io, socket, roomCreated) => {
    const { link, friendTabId, userData } = data;

    if (!roomCreated[link] || typeof roomCreated[link] === "undefined") {
        return socket.emit("join error", { "errors": "La table que vous essayez de rejoindre n'existe pas" });
    }

    socket.join(link);

    const tab = await Tab.findOne({ "_id": friendTabId });
    const lists = await List.find({ "tabId": tab._id });
    const tasks = await Task.find({ "tabId": tab._id });

    const cryptedLists = await cryptUserData(lists);
    const cryptedTasks = await cryptUserData(tasks);

    const checkUserStatus = () => {
        const guestUser = roomCreated[link].guests.filter((guest) => guest.userData.username === userData.username);
        const operatorUser = roomCreated[link].operators.filter((guest) => guest.userData.username === userData.username);

        return {
            "isConnected": guestUser.length > 0 || operatorUser.length > 0,
            "isOp": operatorUser.length > 0
        };
    };

    if (!checkUserStatus().isConnected) {
        roomCreated[link].guests = [...roomCreated[link].guests, { "userData": { ...userData, "socketId": socket.id }, "isOnline": true }];
    } else {
        const { isOp } = checkUserStatus();

        if (isOp) {
            roomCreated[link].operators = roomCreated[link].operators.map((op) => {
                if (op.userData.username === userData.username) {
                    op.isOnline = true;
                    op.userData.socketId = socket.id;
                }
                return op;
            });
        } else {
            roomCreated[link].guests = roomCreated[link].guests.map((guest) => {
                if (guest.userData.username === userData.username) {
                    guest.isOnline = true;
                    guest.userData.socketId = socket.id;
                }
                return guest;
            });
        }
    }

    socket.emit("tab joined", { "socket": roomCreated[link], "tabData": tab, "lists": cryptedLists, "tasks": cryptedTasks });

    io.to(link).emit("user joined room", { "message": `${userData.username} a rejoint votre tableau !`, "userData": { ...userData, "socketId": socket.id }, "currentSocket": roomCreated[link] });
};

exports.leaveRoom = (room, io, socket, roomCreated) => {

    const { name, userData } = room;

    roomCreated[name].guests = roomCreated[name].guests.filter((guest) => guest.userData.userID !== userData.userID);
    roomCreated[name].operators = roomCreated[name].operators.filter((guest) => guest.userData.userID !== userData.userID);
    io.to(name).emit("user leave", { "message": `${userData.username} a quitté votre instance`, userData, "socketId": socket.id, "currentSocket": roomCreated[name] });
    socket.leave(name);
    socket.disconnect();
};

exports.sendLists = (lists, io, socket, roomCreated) => {
    roomCreated[lists[1]].lists = lists[0];
    io.to(lists[1]).emit("send owner lists", roomCreated[lists[1]]);
};

exports.sendTasks = (tasks, io, socket, roomCreated) => {
    roomCreated[tasks[1]].tasks = tasks[0];
    io.to(tasks[1]).emit("send owner tasks", roomCreated[tasks[1]]);
};

exports.sendActions = (actions, io, socket, roomCreated) => {
    io.to(actions[1]).emit("send tab actions", actions[0]);
};

exports.sendTab = (tab, io, socket, roomCreated) => {
    roomCreated[tab[1]].tab = tab[0];
    io.to(tab[1]).emit("tab updated", { "tab": tab[0], "currentSocket": roomCreated[tab[1]] });
};

exports.sendMessage = async (data, io, socket) => {
    const { message, link } = data,
        { title, author, authorID, tabId } = message;

    if (!title.length || title.length > 200) {
        return socket.emit("send message failed", ("Le message doit faire obligatoirement entre 1 et 200 caractères"));
    }

    const newMessage = new Message({
        title,
        author,
        authorID,
        tabId
    });

    try {
        await newMessage.save();

        const messages = await Message.find({ tabId });

        return io.to(link).emit("send message", messages);

    } catch (e) {
        return socket.emit("send message failed", { "errors": "Le message doit faire obligatoirement entre 1 et 200 caractères", e });
    }
};

exports.changeUserRole = (data, io, socket, roomCreated) => {
    const { link, userData, isThisAPromotion } = data;

    if (isThisAPromotion) {
        const oldGuest = roomCreated[link].guests.filter((guest) => guest.userData.username === userData.username)[0];
        const newGuestsArray = roomCreated[link].guests.filter((guest) => guest.userData.username !== userData.username);

        roomCreated[link].operators.push({ "userData": { ...userData }, "isOnline": oldGuest.isOnline });
        roomCreated[link].guests = newGuestsArray;
    } else {
        const oldOperator = roomCreated[link].operators.filter((op) => op.userData.username === userData.username)[0];
        const newOperatorsArray = roomCreated[link].operators.filter((op) => op.userData.username !== userData.username);

        roomCreated[link].guests.push({ "userData": { ...userData }, "isOnline": oldOperator.isOnline });
        roomCreated[link].operators = newOperatorsArray;
    }
    return io.to(link).emit("change user role", roomCreated[link]);
};
