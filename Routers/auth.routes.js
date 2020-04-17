const express = require("express");
const authCtrl = require("../Controllers/user");
const checker = require("../Utils/auth");
const authMw = require("../Middlewares/auth");

const router = express.Router();


router.post("/signup/", checker.signup, authCtrl.signup);
router.post("/login/", checker.login, authCtrl.login);
router.post("/delete/", [checker.delete, authMw], authCtrl.delete);
router.post("/update-username/", [checker.username, authMw], authCtrl.updateUsername);
router.post("/update-email", [checker.email, authMw], authCtrl.updateEmail);
router.post("/update-password", [checker.password, authMw], authCtrl.updatePassword);
router.get("/user/:id", authMw, authCtrl.getinfo);

module.exports = router;
