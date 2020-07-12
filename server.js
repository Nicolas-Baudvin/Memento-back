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
const Friends = require("./Models/friends");


const roomCreated = {};

io.on("connection", (socket) => {
    console.log("un utilisateur s'est connecté au réseau");

    socket.on("identify", (userData) => SocketAuthCtrl.identify(userData, socket, io));

    socket.on("new_tab", (data) => SocketTabCtrl.createTab(data, io, socket, roomCreated));

    socket.on("disconnect", async () => {
        console.log("déconnexion d'un utilisateur");
        const keys = Object.keys(socket.adapter.rooms);
        const rooms = Object.keys(roomCreated);

        const user = await User.findOne({ "socketID": socket.id });
        const userFriends = await Friends.findOne({ "userID": user._id });

        if (userFriends) {
            userFriends.list.forEach(async (userFriend) => {
                const friend = await User.findOne({ "username": userFriend.username });
                const friendsOfFriend = await Friends.findOne({ "userID": friend._id });

                const newList = friendsOfFriend.list.map((elem) => {
                    if (elem.username === user.username) {
                        elem.socketID = "";
                        elem.isOnline = false;
                    }
                    return elem;
                });

                await Friends.updateOne({ "userID": friend._id }, { "list": newList });
                const friendsUpdated = await Friends.findOne({ "userID": friend._id });

                if (friend.socketID) {
                    io.to(friend.socketID).emit("update friend list", friendsUpdated.list);
                }
            });
        }

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
        await User.updateOne({ "socketID": socket.id }, { "socketID": "" });
        socket.leaveAll();
    });

    socket.on("join tab", (link) => SocketTabCtrl.joinTab(link, io, socket, roomCreated));

    socket.on("leave room", (room) => SocketTabCtrl.leaveRoom(room, io, socket, roomCreated));

    socket.on("end", (link) => {
        socket.leave(link);
    });
    
    socket.on("off", () => {
        socket.disconnect();
    });

    socket.on("send lists", (lists) => SocketTabCtrl.sendLists(lists, io, socket, roomCreated));

    socket.on("send tasks", (tasks) => SocketTabCtrl.sendTasks(tasks, io, socket, roomCreated));

    socket.on("send actions", (actions) => SocketTabCtrl.sendActions(actions, io, socket, roomCreated));

    socket.on("send tab", (tab) => SocketTabCtrl.sendTab(tab, io, socket, roomCreated));

    socket.on("send message", (message) => SocketTabCtrl.sendMessage(message, io, socket));

    socket.on("change user role", (data) => SocketTabCtrl.changeUserRole(data, io, socket, roomCreated));

    socket.on("send invitation", (data) => SocketInvitationCtl.sendInvite(data, io, socket));

    socket.on("decline invitation", (data) => SocketInvitationCtl.decline(data, io, socket));

    socket.on("invitation to be friend", async (data) => SocketInvitationCtl.sendFriendInvite(data, io, socket));

    socket.on("accept friend invitation", async (data) => SocketInvitationCtl.acceptInvitation(data, io, socket));
});
