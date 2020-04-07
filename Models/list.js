const mongoose = require("mongoose");

const ListSchema = mongoose.Schema({
    "name": { "type": String, "isRequired": true },
    "order": { "type": Number, "isRequired": true },
    "userId": { "type": String, "isRequired": true },
    "tabId": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("List", ListSchema);