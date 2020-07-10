const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema({
    "username": { "type": String, "required": true, "unique": true },
    "password": { "type": String, "required": true },
    "email": { "type": String, "required": true, "unique": true },
    "mytheme": { "type": Object, "required": false },
    "socketID": { "type": String, "required": false }
});

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", UserSchema);
