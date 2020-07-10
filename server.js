const http = require("http"),
    app = require("./app");

const server = http.createServer(app);

const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};
const port = normalizePort(process.env.PORT || "5000");

app.set("port", port);

const errorHandler = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === "string" ? `pipe ${address}` : `port: ${port}`;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges.`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use.`);
            process.exit(1);
            break;
        default:
            throw error;
    }
};


server.on("error", errorHandler);
server.on("listening", () => {
    const address = server.address();
    const bind = typeof address === "string" ? `pipe ${address}` : `port ${port}`;

    console.log(`Listening on ${bind}`);
});

server.listen(port);

/**
 * Socket
 */

const io = require("socket.io")(server);
const SocketAuthCtrl = require("./Controllers/SocketControllers/auth");
const SocketTabCtrl = require("./Controllers/SocketControllers/tab");
const SocketInvitationCtl = require("./Controllers/SocketControllers/invitation");
const User = require("./Models/user");
const Notifs = require("./Models/notifs");
const Friends = require("./Models/friends");

const roomCreated = {};

io.on("connection", (socket) => {
    console.log("un utilisateur s'est connecté au réseau");

    socket.on("identify", (userData) => SocketAuthCtrl.identify(userData, socket));

    socket.on("new_tab", (data) => SocketTabCtrl.createTab(data, io, socket, roomCreated));

    socket.on("disconnect", async () => {
        const keys = Object.keys(socket.adapter.rooms);
        const rooms = Object.keys(roomCreated);

        await User.updateOne({ "socketID": socket.id }, { "socketID": "" });

        rooms.forEach((room) => {
            roomCreated[room].guests = roomCreated[room].guests.map((guest) => {
                if (guest.userData.socketId === socket.id) {
                    guest.isOnline = false;
                }
                return guest;
            });
            roomCreated[room].operators = roomCreated[room].operators.map((op) => {
                if (op.userData.socketId === socket.id) {
                    op.isOnline = false;
                }
                return op;
            });
        });

        keys.forEach((key) => {
            socket.to(key).emit("user leave", { "socketId": socket.id, "currentSocket": roomCreated[key] });
        });
        socket.leaveAll();
    });

    socket.on("join tab", (link) => SocketTabCtrl.joinTab(link, io, socket, roomCreated));

    socket.on("leave room", (room) => SocketTabCtrl.leaveRoom(room, io, socket, roomCreated));

    socket.on("end", (link) => {
        socket.leave(link);
    });

    socket.on("send lists", (lists) => SocketTabCtrl.sendLists(lists, io, socket, roomCreated));

    socket.on("send tasks", (tasks) => SocketTabCtrl.sendTasks(tasks, io, socket, roomCreated));

    socket.on("send actions", (actions) => SocketTabCtrl.sendActions(actions, io, socket, roomCreated));

    socket.on("send tab", (tab) => SocketTabCtrl.sendTab(tab, io, socket, roomCreated));

    socket.on("send message", (message) => SocketTabCtrl.sendMessage(message, io, socket));

    socket.on("change user role", (data) => SocketTabCtrl.changeUserRole(data, io, socket, roomCreated));

    socket.on("send invitation", (data) => SocketInvitationCtl.sendInvite(data, io, socket));

    socket.on("decline invitation", (data) => SocketInvitationCtl.decline(data, io, socket));

    socket.on("invitation to be friend", async (data) => {
        const { to, from } = data;

        from.socketID = socket.id;

        if (to.socketID) {
            io.to(to.socketID).emit("invitation to be friend", ({ "from": from, "message": `${from.username} souhaite devenir votre ami` }));
        } else {
            const newNotif = new Notifs({
                "title": `${from.username} souhaite devenir votre ami`,
                "from": from.username,
                "userID": to._id
            });

            await newNotif.save();
        }
    });

    socket.on("accept friend invitation", async (data) => {
        const { owner, isFromNotif, userID } = data;

        try {
            const recipient = await User.findOne({ "_id": userID });
            const transmitter = await User.findOne({ "username": owner });

            const recipientFriends = await Friends.findOne({ "userID": recipient._id });
            const transmitterFriends = await Friends.findOne({ "userID": transmitter._id });

            if (!recipientFriends) {
                const newRecipientFriends = new Friends({
                    "userID": recipient._id,
                    "list": [{ "username": transmitter.username }]
                });

                await newRecipientFriends.save();
            } else {
                const isAlreadyFriend = recipientFriends.list.filter((friend) => friend.username === transmitter.username).length;

                if (!isAlreadyFriend) {
                    recipientFriends.list = [...recipientFriends.list, { "username": transmitter.username }];
                    await recipientFriends.save();
                } else {
                    io.to(transmitter.socketID).emit(
                        "already friends",
                        { "transmitter": recipient.username, "message": `Vous êtes déjà amis avec ${recipient.username}` }
                    );
                    return io.to(recipient.socketID).emit(
                        "already friends",
                        { "transmitter": transmitter.username, "message": `Vous êtes déjà amis avec ${transmitter.username}` }
                    );
                }
            }
            if (!transmitterFriends) {
                const newTransmitterFriends = new Friends({
                    "userID": transmitter._id,
                    "list": [{ "username": recipient.username }]
                });

                await newTransmitterFriends.save();
            } else {
                const isAlreadyFriend = transmitterFriends.list.filter((friend) => friend.username === recipient.username).length;

                if (!isAlreadyFriend) {
                    transmitterFriends.list = [...transmitterFriends.list, { "username": recipient.username }];
                    await transmitterFriends.save();
                } else {
                    return io.to(transmitter.socketID).emit(
                        "already friends",
                        { "transmitter": recipient.username, "message": `Vous êtes déjà amis avec ${recipient.username}` }
                    );
                }
            }

            if (isFromNotif) {
                await Notifs.deleteMany({ "title": `${transmitter.username} souhaite devenir votre ami` });
            }
            const tFriends = await Friends.findOne({ "userID": transmitter._id });
            const rFriends = await Friends.findOne({ "userID": recipient._id });

            io.to(transmitter.socketID).emit("accept friend invitation", {
                "msg": `${recipient.username} a accepté votre invitation, vous êtes désormais amis !`,
                "friends": tFriends.list
            });
            io.to(recipient.socketID).emit("confirm accept invitation", {
                "msg": `vous êtes désormais amis avec ${transmitter.username} !`,
                "friends": rFriends.list
            });
        } catch (e) {
            console.log(e);
        }
    });
});
