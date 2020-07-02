const jwt = require("jsonwebtoken");
const User = require("../../Models/user");

exports.identify = async (userData, socket) => {

    const { token, userID } = userData;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

        if (decoded.userID !== userID) {
            socket.emit("fail_identify");
            socket.leaveAll();
            return socket.disconnect();
        }
        await User.updateOne({ "_id": userID }, { "socketID": socket.id });
        return socket.emit("success identify");
    } catch (e) {
        console.log(e);
        socket.emit("fail_identify", e);
        throw new Error(e);
    }
};
