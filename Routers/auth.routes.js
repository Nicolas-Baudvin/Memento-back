const express = require("express");
const authCtrl = require("../Controllers/user");
const checker = require("../Utils/auth");

const router = express.Router();


router.post("/signup/", checker.signup, authCtrl.signup);
router.post("/login/", checker.login, authCtrl.login);

module.exports = router;
