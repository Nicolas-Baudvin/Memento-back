const express = require("express");
const taskCtrl = require("../Controllers/task");

const router = express.Router();

router.get("/:id", taskCtrl.find);
router.post("/create/", taskCtrl.create);
router.post("/update", taskCtrl.update);
router.post("/delete/", taskCtrl.delete);

module.exports = router;
