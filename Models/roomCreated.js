const mongoose = require("mongoose");

const RoomCreated = new mongoose.Schema({
    "room": { "type": Object, "required": false }
});

module.exports = mongoose.model("RoomCreated", RoomCreated);
