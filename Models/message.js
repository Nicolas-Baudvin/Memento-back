const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    "title": { "type": String, "required": true },
    "author": { "type": String, "required": true },
    "authorID": { "type": String, "required": true },
    "tabId": { "type": String, "required": true }
}, { "timestamps": true });

module.exports = mongoose.model("Message", MessageSchema);
