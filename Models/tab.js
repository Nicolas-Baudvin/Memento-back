const mongoose = require("mongoose");

const TabSchema = new mongoose.Schema({
    "name": { "type": String, "required": true },
    "socketRoomName": { "type": String, "required": false },
    "created_at": { "type": String, "required": true },
    "imgPath": { "type": String, "required": true },
    "userID": { "type": String, "required": true },
    "isPublic": { "type": Boolean, "required": false },
    "owner": { "type": String, "required": false }
});

module.exports = mongoose.model("Tab", TabSchema);
