const jwt = require("jsonwebtoken");
const User = require("../../Models/user");
const Notifs = require("../../Models/notifs");
const Friends = require("../../Models/friends");

exports.identify = async (userData, socket, io) => {

    const { token, userID } = userData;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

        if (decoded.userID !== userID) {
            socket.emit("fail_identify");
            socket.leaveAll();
            return socket.disconnect();
        }
        await User.updateOne({ "_id": userID }, { "socketID": socket.id });
        const user = await User.findOne({ "socketID": socket.id });
        const userFriends = await Friends.findOne({ "userID": user._id });

        if (userFriends) {
            userFriends.list.forEach(async (userFriend) => {
                const friend = await User.findOne({ "username": userFriend.username });
                const friendsOfFriend = await Friends.findOne({ "userID": friend._id });

                const newList = friendsOfFriend.list.map((elem) => {
                    if (elem.username === user.username) {
                        elem.socketID = socket.id;
                        elem.isOnline = true;
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
        const notifs = await Notifs.find({ userID });
        const friends = await Friends.findOne({ userID });


        return socket.emit("success identify", { notifs, "friends": friends ? friends.list : [] });
    } catch (e) {
        console.log(e);
        socket.emit("fail_identify", e);
        throw new Error(e);
    }
};
