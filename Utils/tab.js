const { check } = require("express-validator");

exports.create = [
    check("name").notEmpty().withMessage("Tous les champs sont obligatoires")
];

exports.find = [
    check("id").notEmpty().withMessage("Cette table est introuvable.")
];

exports.delete = [
    check("tabId").notEmpty().withMessage("Cette table est introuvable.")
];

exports.update = [
    check("name").notEmpty().withMessage("Vous devez au moins remplir un champs"),
    check("id").notEmpty().withMessage("Cette table est introuvable.")
];
