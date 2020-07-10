const jwt = require("jsonwebtoken");
const User = require("../../Models/user");
const Notifs = require("../../Models/notifs");

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
        const notifs = await Notifs.find({ userID });

        return socket.emit("success identify", notifs);
    } catch (e) {
        console.log(e);
        socket.emit("fail_identify", e);
        throw new Error(e);
    }
};
