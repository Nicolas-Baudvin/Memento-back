const express = require("express");
const taskCtrl = require("../Controllers/task");
const checker = require("../Utils/task");
const authMw = require("../Middlewares/auth");

const router = express.Router();

router.post("/find/", authMw, taskCtrl.find);
router.post("/create/", [checker.create, authMw], taskCtrl.create);
router.post("/update", taskCtrl.update);
router.post("/delete/", taskCtrl.delete);

module.exports = router;
