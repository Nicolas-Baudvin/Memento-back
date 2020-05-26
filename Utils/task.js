const { check } = require("express-validator");

exports.create = [
    check("title").notEmpty().withMessage("La description de la tâche ne peut pas être vide"),
    check("title").isLength({ "min": 1, "max": 200 }).withMessage("Une tâche peut contenir entre 1 et 200 caractères")
];

exports.updateName = [
    check("title").notEmpty().withMessage("Le nom ne peut pas être vide"),
    check("title").isLength({ "min": 1, "max": 25 })
];

exports.updateLabel = [
    check("label").notEmpty().withMessage("Label Invalide")
];

exports.updateOrder = [
    check("tasks").isArray()
];

exports.assignTask = [
    check("username").notEmpty().withMessage("La tâche doit être assignée à quelqu'un")
];