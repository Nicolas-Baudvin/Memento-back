const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new mongoose.Schema({
    "username": { "type": String, "isRequired": true, "unique": true },
    "password": { "type": String, "isRequired": true },
    "email": { "type": String, "isRequired": true, "unique": true }
});

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", UserSchema);
