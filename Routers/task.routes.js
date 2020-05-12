const express = require("express");
const taskCtrl = require("../Controllers/task");
const checker = require("../Utils/task");
const authMw = require("../Middlewares/auth");

const router = express.Router();

router.post("/find/", authMw, taskCtrl.find);
router.post("/create/", [checker.create, authMw], taskCtrl.create);
router.post("/update-name/", [checker.updateName, authMw], taskCtrl.updateName);
router.post("/update-label/", [checker.updateLabel, authMw], taskCtrl.updateLabel);
router.post("/update-order/", [checker.updateOrder, authMw], taskCtrl.updateOrder);
router.post("/delete/", authMw, taskCtrl.delete);

module.exports = router;
