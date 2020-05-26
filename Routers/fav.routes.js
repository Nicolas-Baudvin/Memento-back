const express = require("express");
const favCtrl = require("../Controllers/fav");
const router = express.Router();


router.post("/new-fav/", favCtrl.newFav);
router.post("/delete-favs/", favCtrl.deleteFav);
router.post("/get-favs/", favCtrl.getFav);
router.post("/get-fav-tabs/", favCtrl.getFavTabs);

module.exports = router;
