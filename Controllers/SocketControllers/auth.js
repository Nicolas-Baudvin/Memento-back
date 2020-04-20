const jwt = require("jsonwebtoken");

exports.identify = async (userData, socket) => {

    const { token, userID } = userData;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

        if (decoded.userID !== userID) {
            console.log("deconnexion de l'utilisateur => mauvaise identitée");
            socket.emit("fail_identify");
            return socket.disconnect();
        }
        console.log("Connexion authentifiée");
        return socket.emit("success identify");
    } catch (e) {
        throw new Error({ e, "errors": "Une erreur est survenue" });
    }

};
