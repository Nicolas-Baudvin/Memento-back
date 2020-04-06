const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
    "name": { "type": String, "isRequired": true },
    "desc": { "type": String, "isRequied": true },
    "order": { "type": String, "isRequired": true },
    "listId": { "type": String, "isRequired": true },
    "labelId": { "type": Array, "isRequied": true }
});

module.exports = mongoose.model("Task", TaskSchema);
