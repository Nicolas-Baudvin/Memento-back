const express = require("express");
const listCtrl = require("../Controllers/list");
const authMw = require("../Middlewares/auth");
const checker = require("../Utils/list");

const router = express.Router();

router.post("/find/", [authMw, checker.find], listCtrl.find);
router.post("/create/", [authMw, checker.create], listCtrl.create);
router.post("/update", [authMw, checker.update], listCtrl.update);
router.post("/delete/", [authMw, checker.delete], listCtrl.delete);
router.post("/update-order/", [authMw], listCtrl.updateOrder);

module.exports = router;
