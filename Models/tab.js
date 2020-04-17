const mongoose = require("mongoose");

const TabSchema = mongoose.Schema({
    "name": { "type": String, "isRequired": true },
    "socketRoomName": { "type": String, "isRequired": false },
    "created_at": { "type": String, "isRequired": true },
    "imgPath": { "type": String, "isRequired": true },
    "userID": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("Tab", TabSchema);
