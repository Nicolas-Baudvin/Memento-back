const { check } = require("express-validator");

exports.create = [
    check("name").notEmpty().withMessage("Tous les champs sont obligatoires"),
    check("name").isLength({ "min": 1, "max": 30 }).withMessage("Le nom ne doit pas excéder 30 caractères")
];

exports.find = [
    check("id").notEmpty().withMessage("Tableau introuvable.")
];

exports.delete = [
    check("tabId").notEmpty().withMessage("Tableau introuvable.")
];

exports.updateName = [
    check("name").notEmpty().withMessage("Vous devez au moins remplir un champs")
];

exports.updatePic = [
    check("imgPath").notEmpty().withMessage("Image non valide")
];

