const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    "userID": { "type": String, "required": true },
    "list": { "type": Array, "required": true }
});

module.exports = mongoose.model("Friends", FriendSchema);
