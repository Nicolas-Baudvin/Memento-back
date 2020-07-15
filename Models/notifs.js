const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

const NotifSchema = new mongoose.Schema({
    "title": { "type": String, "required": true },
    "from": { "type": String || Boolean, "required": true },
    "userID": { "type": String || Boolean, "required": true },
    "isActionNotif": { "type": Boolean, "required": true } // display Accept button or not
});

NotifSchema.plugin(timeZone);

module.exports = mongoose.model("Notifs", NotifSchema);
