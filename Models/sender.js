const mongoose = require("mongoose");

const SenderSchema = new mongoose.Schema({
    "email": { "type": String, "required": true },
    "subject": { "type": String, "required": true },
    "message": { "type": String, "required": true }
});

module.exports = mongoose.model("Sender", SenderSchema);
