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

const roomCreated = {};

io.on("connection", (socket) => {
    console.log("un utilisateur s'est connecté au réseau");
    /**
     * Vérification de l'identité de l'utilisateur entrant
     */
    socket.on("identify", (userData) => SocketAuthCtrl.identify(userData, socket));

    socket.on("new_tab", (data) => SocketTabCtrl.createTab(data, io, socket, roomCreated));

    socket.on("room clients", (roomData) => {
        console.log("vérification du nombre de client pour le channel", roomData.name);
        // nombre de socket connecté au channel
        console.log(io.sockets.adapter.rooms);
    });

    socket.on("disconnect", () => {
        const keys = Object.keys(socket.adapter.rooms);
        const rooms = Object.keys(roomCreated);

        rooms.forEach((room) => {
            roomCreated[room].guests = roomCreated[room].guests.filter((x) => x.userData.socketId !== socket.id);
        });

        keys.forEach((key) => {
            socket.to(key).emit("user leave", { "socketId": socket.id, "currentSocket": roomCreated[key] });
        });

        console.log("déconnexion d'un utilisateur", roomCreated);
        socket.leaveAll();
    });

    socket.on("join tab", (link) => SocketTabCtrl.joinTab(link, io, socket, roomCreated));

    socket.on("leave room", (room) => SocketTabCtrl.leaveRoom(room, io, socket, roomCreated));

    socket.on("end", () => {
        socket.disconnect();
    });

    socket.on("send lists", (lists) => SocketTabCtrl.sendLists(lists, io, socket, roomCreated));

    socket.on("send tasks", (tasks) => SocketTabCtrl.sendTasks(tasks, io, socket, roomCreated));
});
