/* eslint-disable operator-linebreak */
/* eslint-disable quotes */
const bcrypt = require("bcrypt"),
    jwt = require("jsonwebtoken"),
    mailer = require("nodemailer"),
    { validationResult } = require("express-validator");

// Models
const User = require("../Models/user"),
    Tab = require("../Models/tab"),
    List = require("../Models/list"),
    Task = require("../Models/task");

const mailConfig = {
    "host": "smtpout.Europe.secureServer.net",
    "secureConnection": true,
    "port": 465,
    "tls": {
        "ciphers": 'SSLv3'
    },
    "auth": {
        "user": process.env.EMAIL_SMTP,
        "pass": process.env.EMAIL_PASS
    }
};

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

exports.delete = async (req, res) => {
    const { userID } = req.body;

    User.deleteOne({ "_id": userID })
        .then(async () => {
            await Tab.deleteMany({ "userID": userID });
            await List.deleteMany({ "userID": userID });
            await Task.deleteMany({ "userID": userID });

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
        return res.status(400).json({ "errors": "Ce pseudo est déjà le vôtre ! " });
    }

    const currentUser = await User.findOne({ "_id": userID });

    currentUser.password = undefined;

    return res.status(200).json({ "message": `Votre pseudo a bien été modifié. Vous répondrez désormais sous le nom de ${username}`, "userData": currentUser });

};

exports.updateEmail = async (req, res) => {
    const { oldEmail, newEmail } = req.body;
    const errors = validationResult(req);

    // TODO: Créer adresse email + nom de domaine & envoyer confirmation avec NodeMailer

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    res.status(200).json({ "message": "Ce service est indisponible pour le moment." });

};

exports.newEmail = async (req, res) => {

    // TODO: Confirmation du changement d'email

};

exports.updatePassword = async (req, res) => {
    const { oldPass, newPass, newPassConf, userID } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const user = await User.findOne({ "_id": userID });

    if (!user) {
        return res.status(404).json({ "errors": "Utilisateur invalide" });
    }

    const isValid = await bcrypt.compare(oldPass, user.password);

    if (!isValid) {
        return res.status(403).json({ "errors": "L'ancien mot de passe est incorrect" });
    }

    if (newPass !== newPassConf) {
        return res.status(422).json({ "errors": "Les mots de passes ne sont pas identiques" });
    }

    const hash = await bcrypt.hash(newPass, 10);

    console.log(hash);
    if (!hash) {
        return res.status(500).json({ "errors": "Une erreur est survenue sur le serveur. Veuillez réessayer ou contacter un administrateur" });
    }

    user.password = hash;
    const savedUser = await user.save();

    console.log(savedUser);
    if (!savedUser) {
        return res.status(500).json({ "errors": "Une erreur est survenue sur le serveur. Veuillez réessayer ou contacter un administrateur" });
    }

    return res.status(200).json({ "message": "Votre mot de passe a bien été modifié" });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ "errors": "Aucun compte n'est relié à cet email" });
    }

    const token = jwt.sign(
        { "email": user.email, "userID": user._id, "username": user.username },
        process.env.EMAIL_TOKEN,
        { "expiresIn": "1h" }
    );

    const cleanToken = token.split('.').join('&');

    const recoveryLink = `http://localhost:3000/nouveau-mot-de-passe/${cleanToken}`;

    const smtpTransport = mailer.createTransport(mailConfig);

    const mailOptions = {
        "from": mailConfig.auth.user,
        "to": user.email,
        "subject": "Récupération de mot de passe",
        "html": `<body>` +
            `<h1>Bonjour ${user.username} !</h1>` +
            `<p> Vous avez fait une demande de récupération de mot de passe. Voici donc le lien de récupération ci-dessous </p>` +
            `<p> Si cette demande n'est pas de vous, ignorez simplement ce mail. </p>` +
            `<a href="${recoveryLink}" target="_blank">Liens de récupération </a>` +
            `<footer>` +
            `<p> Cet email est un message automatique envoyé par mymemento.fr, merci de ne pas y répondre. </p>` +
            `</footer>` +
            `</body>`
    };

    smtpTransport.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ "errors": "L'email n'a pas pu être envoyé." });
        } else {
            res.status(200).json({ "message": "L'email a bien été envoyé." });
        }
    });

};

exports.newPassword = async (req, res) => {
    const { pass, passConf } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    if (!token) {
        return res.status(401).json({ "notoken": true, "errors": "Identité non vérifiée." });
    }

    if (!pass || !passConf || pass !== passConf) {
        return res.status(422).json({ "notoken": false, "errors": "Les mots de passe doivent êtres identiques et non vides." });
    }

    try {

        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN);
        const userID = decoded.userID;

        const user = await User.updateOne({ "_id": userID }, { "password": pass });

        if (user.email !== decoded.email) {
            return res.status(403).json({ "errors": "Identité invalide" });
        }

        const smtpTransport = mailer.createTransport(mailConfig);

        const mailOptions = {
            "from": mailConfig.auth.user,
            "to": user.email,
            "subject": "Confirmation changement de mot de passe",
            "html": `<body>` +
                `<h1>Bonjour ${user.username} !</h1>` +
                `<p> Nous vous confirmons que votre mot de passe a bien été modifié ! </p>` +
                `<footer>` +
                `<p> Cet email est un message automatique envoyé par https://mymemento.fr, merci de ne pas y répondre. </p>` +
                `</footer>` +
                `</body>`
        };

        smtpTransport.sendMail(mailOptions, (err) => {
            console.log(err);
        });
        
        res.status(200).json({ "message": "Le mot de passe a bien été modifié." });
        
    } catch(e) {
        console.log(e);
        return res.status(401).json({ "errors": "Identité non vérifiée" });
    }
};
