const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
    "name": { "type": String, "isRequired": true },
    "order": { "type": Number, "isRequired": true },
    "tabId": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("List", ListSchema);
