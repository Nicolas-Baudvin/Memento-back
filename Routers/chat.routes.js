const express = require("express");
const chatCtrl = require("../Controllers/chat");

const router = express.Router();

router.post("/find/", chatCtrl.find);

module.exports = router;
