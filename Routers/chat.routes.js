const express = require("express");
const chatCtrl = require("../Controllers/chat");
const authMw = require("../Middlewares/auth");

const router = express.Router();

router.post("/find/", authMw, chatCtrl.find);

module.exports = router;
