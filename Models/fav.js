const mongoose = require("mongoose");

const FavSchema = mongoose.Schema({
    "userID": { "type": String, "required": true },
    "favTabs": { "type": Array, "required": true }
});


module.exports = mongoose.model('Fav', FavSchema);
