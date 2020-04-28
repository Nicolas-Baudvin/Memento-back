const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
    "title": { "type": String, "isRequired": true },
    "desc": { "type": String, "isRequired": false },
    "order": { "type": String, "isRequired": true },
    "listId": { "type": String, "isRequired": true },
    "labelId": { "type": Array, "isRequired": false },
    "tabId": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("Task", TaskSchema);
