const mongoose = require("mongoose");

const TabSchema = mongoose.Schema({
    "name": { "type": String, "isRequired": true },
    "socketId": { "type": String, "isRequired": true },
    "created_at": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("Task", TabSchema);
