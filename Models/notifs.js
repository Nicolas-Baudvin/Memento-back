const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

const NotifSchema = new mongoose.Schema({
    "title": { "type": String, "required": true },
    "from": { "type": String, "required": true },
    "userID": { "type": String, "required": true }
});

NotifSchema.plugin(timeZone);

module.exports = mongoose.model("Notifs", NotifSchema);
