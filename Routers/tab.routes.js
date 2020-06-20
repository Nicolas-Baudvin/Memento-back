const express = require("express");
const TabCtrl = require("../Controllers/tab");
const auth = require("../Middlewares/auth");
const checker = require("../Utils/tab");

const router = express.Router();

router.get("/:id", auth, TabCtrl.find);
router.post("/create/", [checker.create, auth], TabCtrl.create);
router.patch("/update-name/", [checker.updateName, auth], TabCtrl.updateName);
router.patch("/update-pic/", [checker.updatePic, auth], TabCtrl.updatePic);
router.delete("/delete/", [auth, checker.delete], TabCtrl.delete);
router.post("/public-tab/", TabCtrl.publicTab);
router.patch("/change-status/", TabCtrl.changeTabStatus);

module.exports = router;
