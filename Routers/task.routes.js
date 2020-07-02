const express = require("express");
const taskCtrl = require("../Controllers/task");
const checker = require("../Utils/task");
const authMw = require("../Middlewares/auth");

const router = express.Router();

router.post("/find/", taskCtrl.find);
router.post("/create/", [checker.create, authMw], taskCtrl.create);
router.patch("/update-name/", [checker.updateName, authMw], taskCtrl.updateName);
router.patch("/update-label/", [checker.updateLabel, authMw], taskCtrl.updateLabel);
router.patch("/update-order/", [checker.updateOrder, authMw], taskCtrl.updateOrder);
router.put("/assign-task/", [checker.assignTask, authMw], taskCtrl.updateAssign);
router.delete("/delete/", authMw, taskCtrl.delete);

module.exports = router;
