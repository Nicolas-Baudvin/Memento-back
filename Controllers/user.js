const bcrypt = require("bcrypt");
const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.signup = async (req, res) => {
    const { email, password, username } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const userEmail = await User.findOne({ email });
    const userUsername = await User.findOne({ username });

    if (userEmail) {
        return res.status(422).json({ "errors": "Cet email existe déjà" });
    }
    if (userUsername) {
        return res.status(422).json({ "errors": "Ce pseudonyme existe déjà" });
    }

    bcrypt.hash(password, 10)
        .then((hash) => {
            const newUser = new User({
                email,
                username,
                "password": hash
            });

            newUser.save()
                .then(() => {
                    return res.status(201).json({ "message": "Vous êtes désormais inscris ! Vous n'avez plus qu'à vous connecter en cliquant sur le bouton connexion au dessus du formulaire" });
                })
                .catch((err) => {
                    return res.status(500).json({ err, "errors": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
                });
        })
        .catch((err) => {
            return res.status(500).json({ err, "errors": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
        });
};

exports.login = async (req, res) => {
    const { password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const user = await User.findOne({ email });

    if (user) {
        bcrypt.compare(password, user.password, (err, valid) => {
            if (err) {
                return res.status(500).json({ err, "errors": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
            }

            if (!valid) {
                return res.status(401).json({ "errors": "Les identifiants sont incorrects" });
            }

            const token = jwt.sign(
                {
                    "userID": user._id,
                    "email": user.email
                },
                process.env.SECRET_TOKEN_KEY,
                { "expiresIn": "1h" }
            );

            return res.status(200).json({
                "email": user.email,
                "username": user.username,
                "userID": user._id,
                token,
                "message": "Vous êtes désormais connecté"
            });
        });
    } else {
        return res.status(401).json({ "errors": "Les identifiants sont incorrects" });
    }

};

exports.delete = (req, res) => {
    User.deleteOne({ "_id": req.body.userID })
        .then(() => {
            res.status(200).json({ "errors": "Votre compte a bien été supprimé" });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ "errors": "Une erreur sur le serveur est survenue, réessayez ou contacter l'administrateur" });
        });

};

exports.getinfo = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ "_id": id });

    if (!user) {
        return res.status(401).json({ "errors": "Vous n'êtes pas autorisés à utiliser cette fonctionnalité" });
    }

    res.status(200).json({ "userID": user._id, "username": user.username, "email": user.email });

};

exports.updateUsername = async (req, res) => {
    const { username, userID } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const user = await User.updateOne({ "_id": userID }, { "username": username });

    if (!user.n) {
        return res.status(404).json({ "errors": "Une erreur est survenue. Réessayez ou contacter l'administrateur" });
    }
    if (!user.nModified) {
        return res.status(400).json({ "errors": "Ce pseudo est déjà le votre ! " });
    }

    const currentUser = await User.findOne({ "_id": userID });

    currentUser.password = undefined;

    return res.status(200).json({ "message": `Votre pseudo a bien été modifié. Vous répondrez désormais sous le nom de ${username}`, "userData": currentUser });

};

exports.updateEmail = async (req, res) => {

};

exports.updatePassword = async (req, res) => {

};

exports.forgotPassword = async (req, res) => {

};

exports.newPassword = async (req, res) => {

};