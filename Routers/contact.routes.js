const express = require("express");
const contactCtrl = require("../Controllers/contact");
const checker = require("../Utils/contact");

const router = express.Router();

router.post("/send/", checker.send, contactCtrl.send);

module.exports = router;
