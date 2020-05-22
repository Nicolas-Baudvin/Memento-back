const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema({
    "action": { "type": String, "required": true },
    "author": { "type": String, "required": true },
    "authorID": { "type": String, "required": true },
    "tabId": { "type": String, "required": true }
}, { "timestamps": true });

module.exports = mongoose.model("Action", ActionSchema);
