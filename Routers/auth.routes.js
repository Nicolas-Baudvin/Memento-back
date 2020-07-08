const express = require("express");
const authCtrl = require("../Controllers/user");
const checker = require("../Utils/auth");
const authMw = require("../Middlewares/auth");

const router = express.Router();


router.post("/signup/", checker.signup, authCtrl.signup);
router.post("/login/", checker.login, authCtrl.login);
router.delete("/delete/", [checker.delete, authMw], authCtrl.delete);
router.patch("/update-username/", [checker.username, authMw], authCtrl.updateUsername);
router.patch("/update-email/", [checker.email, authMw], authCtrl.updateEmail);
router.patch("/update-password/", [checker.password, authMw], authCtrl.updatePassword);
router.post("/forgot-password/", [checker.forgotPassword], authCtrl.forgotPassword);
router.patch("/new-email/", authMw, authCtrl.newEmail);
router.patch("/new-password/", [checker.newPassword], authCtrl.newPassword); // nouveau mot de passe après oubli
router.patch("/change-theme/", authMw, authCtrl.updateTheme);
router.post("/user/find", authMw, authCtrl.findUsers);

module.exports = router;
