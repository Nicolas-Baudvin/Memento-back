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
        return res.status(422).json({ "message": "Cet email existe déjà" });
    }
    if (userUsername) {
        return res.status(422).json({ "message": "Ce pseudonyme existe déjà" });
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
                    return res.status(201).json({ "message": "Votre compte a bien été créer." });
                })
                .catch((err) => {
                    return res.status(500).json({ err, "message": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
                });
        })
        .catch((err) => {
            return res.status(500).json({ err, "message": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
        });
};

exports.login = async (req, res) => {
    const { password, username } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const user = await User.findOne({ username });

    if (user) {
        bcrypt.compare(password, user.password, (err, valid) => {
            if (err) {
                return res.status(500).json({ err, "message": "Le serveur a rencontré un problème, réessayez ou contacter un administrateur" });
            }

            if (!valid) {
                return res.status(401).json({ "message": "Les identifiants sont incorrects" });
            }

            const token = jwt.sign(
                {
                    "userID": user._id,
                    username,
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
        return res.status(401).json({ "message": "Les identifiants sont incorrects" });
    }

};

exports.delete = (req, res) => {
    User.deleteOne({ "_id": req.body.userID })
        .then(() => {
            res.status(200).json({ "message": "Votre compte a bien été supprimé" });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ err, "msg": "Une erreur sur le serveur est survenue, réessayez ou contacter l'administrateur" });
        });

};

exports.getinfo = async(req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ "_id": id });

    if (!user) {
        return res.status(401).json({ "message": "Vous n'êtes pas connecté" });
    }

    res.status(200).json({ "userID": user._id, "username": user.username, "email": user.email });

};
