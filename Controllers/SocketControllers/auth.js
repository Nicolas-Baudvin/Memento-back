const jwt = require("jsonwebtoken");

exports.identify = (userData, socket) => {
    const { token, userID } = userData;

    console.log("Identification en cours de l'utilisateur...", token, userID);

    const decoded = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

    if (decoded.userID !== userID) {
        console.log("deconnexion de l'utilisateur => mauvaise identitée");
        socket.emit("fail_identify");
        return socket.disconnect();
    }

    return socket.emit("success_identify");
};
