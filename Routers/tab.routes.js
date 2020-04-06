const express = require("express");
const TabCtrl = require("../Controllers/tab");

const router = express.Router();

router.get("/:id", TabCtrl.find);
router.post("/create/", TabCtrl.create);
router.post("/update", TabCtrl.update);
router.post("/delete/", TabCtrl.delete);

module.exports = router;
