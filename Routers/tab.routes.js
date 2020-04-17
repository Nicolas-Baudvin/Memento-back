const express = require("express");
const TabCtrl = require("../Controllers/tab");
const auth = require("../Middlewares/auth");
const checker = require("../Utils/tab");

const router = express.Router();

router.get("/:id", auth, TabCtrl.find);
router.post("/create/", [checker.create, auth], TabCtrl.create);
router.post("/update", auth, TabCtrl.update);
router.post("/delete/", [auth, checker.delete], TabCtrl.delete);

module.exports = router;
