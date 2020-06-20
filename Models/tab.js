const mongoose = require("mongoose");

const TabSchema = new mongoose.Schema({
    "name": { "type": String, "required": true },
    "socketRoomName": { "type": String, "required": false },
    "imgPath": { "type": String, "required": true },
    "resizedImgPath": { "type": String, "required": true },
    "userID": { "type": String, "required": true },
    "isPublic": { "type": Boolean, "required": false },
    "owner": { "type": String, "required": false }
}, { "timestamps": true });

module.exports = mongoose.model("Tab", TabSchema);
