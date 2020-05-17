const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema({
    "action": { "type": String, "require": true },
    "author": { "type": String, "require": true },
    "authorID": { "type": String, "require": true },
    "tabId": { "type": String, "require": true }
}, { "timestamps": true });

module.exports = mongoose.model("Action", ActionSchema);
