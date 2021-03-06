const { check } = require("express-validator");

exports.signup = [
    check("email").isEmail().withMessage("L'email est invalide !"),
    check("email").isLength({ "min": 6, "max": 100 }).withMessage("Email trop long"),
    check("username").notEmpty().withMessage("Le champs pseudo est obligatoire"),
    check("password").isLength({ "min": 6, "max": 30 }).withMessage("Le mot de passe doit comporter 6 caractères minimum"),
    check("username").isLength({ "min": 3, "max": 30 }).withMessage("Le pseudonyme doit comporter 3 caractères minimum "),
];

exports.login = [
    check("email").notEmpty().withMessage("Le champs pseudo est obligatoire"),
    check("email").isEmail().withMessage("L'email est invalide"),
    check("password").isLength({ "min": 6, "max": 30 }).withMessage("Le mot de passe doit comporter 6 caractères minimum")
];

exports.delete = [
    check("userID").notEmpty().withMessage("Vous n'êtes pas connecté")
];

exports.username = [
    check("username").isLength({ "min": 3, "max": 25 }).withMessage("Le pseudo doit contenir entre 3 et 25 caractères")
];

exports.email = [
    check("newEmail").isEmail().withMessage("Votre ancien email est invalide"),
    check("newEmail").isLength({ "min": 6, "max": 100 }).withMessage("Email trop long"),
    check("oldEmail").isEmail().withMessage("Votre nouvel email est invalide"),
    check("newEmail").custom((value, { req }) => {
        if (value === req.body.oldEmail) {
            throw new Error("Les deux emails doivent être différents !");
        } else {
            return value;
        }
    })
];

exports.password = [
    check("newPass").isLength({ "min": 6, "max": 30 }).withMessage("Le mot de passe doit contenir entre 6 et 30 caractères"),
    check("newPassConf").custom((value, { req }) => {
        if (value === req.body.newPass && value === req.body.oldPass) {
            throw new Error("Votre nouveau mot de passe doit être différent de l'ancien");
        } else if (value !== req.body.newPass) {
            // trow error if passwords do not match
            throw new Error("Les mots de passes ne sont pas identiques");
        } else {
            return value;
        }
    }).withMessage("Les mots de passe ne sont pas identiques"),
    check("oldPass").notEmpty().withMessage("L'ancien mot de passe doit être fourni")
];

exports.forgotPassword = [
    check("email").isEmail().withMessage("L'email fourni est invalide")
];

exports.newPassword = [
    check("pass").notEmpty().withMessage("Les champs sont tous obligatoires"),
    check("passConf").notEmpty().withMessage("Les champs sont tous obligatoires"),
    check("pass").isLength({ "min": 6, "max": 30 }).withMessage("Les mots de passe doivent contenir entre 6 et 30 caractères"),
    check("passConf").isLength({ "min": 6, "max": 30 }).withMessage("Les mots de passe doivent contenir entre 6 et 30 caractères")
];
