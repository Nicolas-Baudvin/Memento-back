const { check } = require("express-validator");

exports.send = [
    check("email").isEmail().withMessage("L'email est invalide"),
    check("subject").notEmpty().withMessage("Le sujet du message doit être précisé"),
    check("message").notEmpty().withMessage("Le message ne doit pas être vide !")
];
