const { check } = require("express-validator");


exports.create = [
    check("name").notEmpty().withMessage("Le nom ne doit pas être vide"),
    check("name").isLength({ "min": 1, "max": 30 }).withMessage("Le nom de la liste doit contenir entre 1 et 30 caractères"),
    check("tabId").notEmpty().withMessage("L'identifiant du tableau n'a pas été transmis")
];

exports.find = [];

exports.update = [
    check("listData").notEmpty().withMessage("Le nouveau nom ne peut pas être vide")
];

exports.delete = [
    check("listID").notEmpty().withMessage("Id de la liste introuvable")
];
