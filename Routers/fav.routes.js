const express = require("express");
const favCtrl = require("../Controllers/fav");
const router = express.Router();
const authMw = require("../Middlewares/auth");


router.post("/new-fav/", authMw, favCtrl.newFav);
router.post("/delete-favs/", authMw, favCtrl.deleteFav);
router.post("/get-favs/", authMw, favCtrl.getFav);
router.post("/get-fav-tabs/", authMw, favCtrl.getFavTabs);

module.exports = router;
