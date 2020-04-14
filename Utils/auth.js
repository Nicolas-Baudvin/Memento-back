const { check } = require("express-validator");

exports.signup = [
    check("email").isEmail().withMessage("L'email est invalide !"),
    check("username").notEmpty().withMessage("Le champs pseudo est obligatoire"),
    check("password").isLength(6).withMessage("Le mot de passe doit comporter 6 caractères minimum"),
    check("username").isLength(3).withMessage("Le pseudonyme doit comporter 3 caractères minimum")
];

exports.login = [
    check("email").notEmpty().withMessage("Le champs pseudo est obligatoire"),
    check("email").isEmail().withMessage("L'email est invalide"),
    check("password").isLength(6).withMessage("Le mot de passe doit comporter 6 caractères minimum")
];

exports.delete = [
    check("userID").notEmpty().withMessage("Vous n'êtes pas connecté"),
    check("username").notEmpty().withMessage("Vous n'êtes pas connecté")
];
