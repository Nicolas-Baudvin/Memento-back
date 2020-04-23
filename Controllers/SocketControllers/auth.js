const jwt = require("jsonwebtoken");

exports.identify = async (userData, socket) => {

    const { token, userID } = userData;
    try {

        jwt.verify(token, process.env.SECRET_TOKEN_KEY, (err, decoded) => {
            if (decoded.userID !== userID) {
                console.log("deconnexion de l'utilisateur => mauvaise identitée", err);
                socket.emit("fail_identify", { err });
                socket.leaveAll();
                return socket.disconnect();
            }
            return socket.emit("success identify");
        });
    } catch (e) {
        throw new Error(e);
    }

};
