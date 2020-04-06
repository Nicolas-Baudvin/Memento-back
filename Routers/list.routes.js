const express = require("express");
const listCtrl = require("../Controllers/list");

const router = express.Router();

router.get("/:id", listCtrl.find);
router.post("/create/", listCtrl.create);
router.post("/update", listCtrl.update);
router.post("/delete/", listCtrl.delete);

module.exports = router;
