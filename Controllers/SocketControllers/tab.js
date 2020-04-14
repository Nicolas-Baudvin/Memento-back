const Base64 = require("crypto-js/enc-base64");
const Utf8 = require("crypto-js/enc-utf8");
const axios = require("axios");
// Model
const Tab = require("../../Models/tab");

exports.createTab = (tabData, io, socket, roomCreated) => {

    // encrypt tabname
    const cryptdRoom = Base64.stringify(Utf8.parse(`${tabData.name}-${tabData.username}`));
    const decrptRoom = Utf8.stringify(Base64.parse(cryptdRoom));
    const date = new Date();

    console.log("crypté :", cryptdRoom, "décrypté :", decrptRoom);

    socket.join(cryptdRoom);

    roomCreated[cryptdRoom] = io.sockets.adapter.rooms[cryptdRoom];
    roomCreated[cryptdRoom].owner = tabData.username; // TODO: Remplacé le pseudo par l'id utilisateur


    // axios({
    //     "method": "post",
    //     "url": "http://localhost:5000/api/tab/create/",
    //     "data": {

    //     },
    //     "headers": {
    //         "Authorization": `Bearer ${token}`
    //     }
    // })
    //     .then((res) => {
    //         socket.emit(
    //             "tab created",
    //             {
    //                 "tabName": cryptdRoom,
    //                 "owner": tabData.username,
    //                 "created_at": "",
    //                 "msg": res.data.msg,
    //                 "tabData": res.data.tabData
    //             }
    //         );

    //     })
    //     .catch((err) => {
    //         socket.emit("server_error", { "error": err.response.data.error });
    //     });

    console.log("Channels total :", io.sockets.adapter.rooms);
};
