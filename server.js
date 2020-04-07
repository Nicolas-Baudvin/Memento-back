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
const url = require("url");
const nsCreated = {};
let matched = false;

io.on("connection", (socket) => {
    console.log("un utilisateur s'est connecté au réseau");
    /**
     * Vérification de l'identité de l'utilisateur entrant
     */
    socket.on("identify", (userData) => SocketAuthCtrl.identify(userData, socket));
    // const { ns } = url.parse(socket.handshake.url, true).query;

    // console.log(ns);
    socket.on("new_tab", (tabData) => {
        socket.join(tabData.name);
    });

    socket.on("room clients", (room) => {
        console.log("vérification du nombre de client pour le channel", room);
        // nombre de socket connecté au channel
        console.log(io.sockets.adapter.rooms[room]);
    });

    socket.on("disconnect", () => {
        console.log("déconnexion d'un utilisateur");
    });
});
