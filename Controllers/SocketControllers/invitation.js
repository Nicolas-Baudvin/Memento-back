const User = require("../../Models/user");
const Notifs = require("../../Models/notifs");
const Friends = require("../../Models/friends");

exports.sendInvite = (data, io, socket) => {
    const { currentTab, socketID, currentSocket } = data;

    io.to(socketID).emit("send invitation", {
        currentTab,
        "message": `${currentTab.owner} vous a inviter à rejoindre son tableau ${currentTab.name}`,
        "invitationLink": `${process.env.CLIENT_URL}/join/${currentTab._id}/${currentSocket.invitationLink}`,
        "owner": socket.id
    });
};

exports.decline = (data, io) => {
    const { socketID, username } = data;
    const message = `${username} a décliné l'invitation.`;

    io.to(socketID).emit("decline invitation", message);
};

exports.sendFriendInvite = async (data, io, socket) => {
    const { to, from } = data;

    from.socketID = socket.id;

    if (to.socketID) {
        io.to(to.socketID).emit("invitation to be friend", ({ "from": from, "message": `${from.username} souhaite devenir votre ami` }));
    } else {
        const isAlreadySent = await Notifs.findOne({ "from": from.username });

        if (!isAlreadySent) {
            const newNotif = new Notifs({
                "title": `${from.username} souhaite devenir votre ami`,
                "from": from.username,
                "userID": to._id,
                "isActionNotif": true
            });

            await newNotif.save();
        } else {
            return io.to(socket.id).emit("err", { "msg": "Vous avez déjà envoyé cette demande" });
        }
    }

    io.to(socket.id).emit("confirm invitation sent", `Confirmation de l'envoie de l'invitation à ${to.username}`);
};

exports.acceptInvitation = async (data, io) => {
    const { owner, userID, notifId, isFromNotif } = data;

     // TODO: refacto
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
                recipientFriends.list = [...recipientFriends.list, { "username": transmitter.username, "socketID": transmitter.socketID, "isOnline": Boolean(transmitter.socketID) }];
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
                transmitterFriends.list = [...transmitterFriends.list, { "username": recipient.username, "socketID": recipient.socketID, "isOnline": Boolean(recipient.socketID) }];
                await transmitterFriends.save();
            } else {
                return io.to(transmitter.socketID).emit(
                    "already friends",
                    { "transmitter": recipient.username, "message": `Vous êtes déjà amis avec ${recipient.username}` }
                );
            }
        }
        const tFriends = await Friends.findOne({ "userID": transmitter._id });
        const rFriends = await Friends.findOne({ "userID": recipient._id });

        let notifs;

        if (notifId) {
            await Notifs.deleteOne({ "_id": notifId });
            notifs = await Notifs.find({ userID });
        }

        io.to(transmitter.socketID).emit("accept friend invitation", {
            "msg": `${recipient.username} a accepté votre invitation, vous êtes désormais amis !`,
            "friends": tFriends.list
        });
        io.to(recipient.socketID).emit("confirm accept invitation", {
            "msg": `vous êtes désormais amis avec ${transmitter.username} !`,
            "friends": rFriends.list,
            "notifs": isFromNotif ? notifs : null
        });
    } catch (e) {
        console.log(e);
    }
};
