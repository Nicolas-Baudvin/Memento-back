exports.sendInvite = (data, io, socket, roomCreated) => {
    const { currentTab, socketID, currentSocket } = data;

    io.to(socketID).emit("send invitation", {
        currentTab,
        "message": `${currentTab.owner} vous a inviter à rejoindre son tableau ${currentTab.name}`,
        "invitationLink": `${process.env.CLIENT_URL}/join/${currentTab._id}/${currentSocket.invitationLink}`,
        "owner": socket.id
    });
};

exports.decline = (data, io, socket) => {
    const { socketID, username } = data;
    const message = `${username} a décliné l'invitation.`;

    io.to(socketID).emit("decline invitation", message);
};
