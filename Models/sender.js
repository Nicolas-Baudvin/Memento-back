const mongoose = require("mongoose");

const SenderSchema = mongoose.Schema({
    "email": { "type": String, "isRequired": true },
    "subject": { "type": String, "isRequired": true },
    "message": { "type": String, "isRequired": true }
});

module.exports = mongoose.model("Sender", SenderSchema);
