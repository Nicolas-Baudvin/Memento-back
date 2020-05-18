const express = require("express");
const actionCtrl = require("../Controllers/actions");

const router = express.Router();

router.post("/create/", actionCtrl.create);
router.post("/find/", actionCtrl.find);

module.exports = router;
