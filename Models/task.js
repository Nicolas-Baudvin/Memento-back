const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    "title": { "type": String, "required": true },
    "order": { "type": Number, "required": true },
    "listId": { "type": String, "required": true },
    "label": { "type": String, "required": false },
    "tabId": { "type": String, "required": true },
    "colorLabel": { "type": String, "required": false },
    "assigned": { "type": String, "required": false }
});

module.exports = mongoose.model("Task", TaskSchema);
