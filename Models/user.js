const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    "username": { "type": String, "isRequired": true, "unique": true },
    "password": { "type": String, "isRequired": true },
    "email": { "type": String, "isRequired": true, "unique": true }
});

module.exports = mongoose.model("User", UserSchema);
