const { validationResult } = require("express-validator"),
    Sender = require("../Models/sender");

exports.send = async (req, res) => {
    const { email, message, subject } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const sender = await new Sender({
        email,
        message,
        subject
    }).save();

    if (!sender) {
        return res.status(500).json({ "message": "Une erreur est survenue sur le serveur, veuillez réessayer ou contacter un administrateur" });
    }
    return res.status(200).json({ "message": "Votre message a bien été reçu, une réponse vous sera envoyé d'ici 48 heures" });

};
