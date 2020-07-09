/* eslint-disable operator-linebreak */
/* eslint-disable quotes */
const bcrypt = require("bcrypt"),
    jwt = require("jsonwebtoken"),
    { encodeString, decodeString, cryptUserData } = require("../Utils/crypt"),
    mailer = require("nodemailer"),
    { validationResult } = require("express-validator");

// Models
const User = require("../Models/user"),
    Tab = require("../Models/tab"),
    List = require("../Models/list"),
    Task = require("../Models/task"),
    Fav = require("../Models/fav"),
    Actions = require("../Models/actions");

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

const userChangeMailPending = {};
const userChangePassPending = {};

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
                "password": hash,
                "mytheme": { "color": "#6e00c8", "title": "Violet", "hovered": "#5d00a9" },
                "socketID": ""
            });

            newUser.save()
                .then(() => {
                    return res.status(201).json({ "message": "Vous êtes désormais inscrit ! Connectez vous sur la page de connexion" });
                })
                .catch((err) => {
                    return res.status(500).json({ err, "errors": "Le serveur a rencontré un problème, réessayez ou contactez un administrateur" });
                });
        })
        .catch((err) => {
            return res.status(500).json({ err, "errors": "Le serveur a rencontré un problème, réessayez ou contactez un administrateur" });
        });
};

exports.login = async (req, res) => {
    const { password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ "errors": "Les identifiants sont incorrects" });
        }
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ "errors": "Les identifiants sont incorrects" });
        }
        const token = jwt.sign(
            {
                "userID": user._id,
                "email": user.email
            },
            process.env.SECRET_TOKEN_KEY,
            { "expiresIn": "2h" }
        );

        return res.status(200).json({
            "email": user.email,
            "username": user.username,
            "userID": user._id,
            "mytheme": user.mytheme,
            "message": "Vous êtes bien connectés !",
            token
        });

    } catch (err) {
        console.log(err);
        if (err.response.status === 401) {
            return res.status(401).json({ "errors": "Les identifiants sont incorrects", err });
        }
        return res.status(500).json({ err });
    }
};

exports.delete = async (req, res) => {
    const { userID } = req.body;

    try {
        const tabs = await Tab.find({ userID });

        if (tabs.length) {

            tabs.forEach(async (tab, index) => {
                await Actions.deleteMany({ "tabId": tab._id });
                if (index === tabs.length - 1) {
                    await User.deleteOne({ "_id": userID });
                    await Tab.deleteMany({ "userID": userID });
                    await List.deleteMany({ "userID": userID });
                    await Task.deleteMany({ "userID": userID });
                    await Fav.deleteOne({ userID });
                    return res.status(200).json({ "message": "Votre compte a bien été supprimé" });
                }
            });
        } else {
            await User.deleteOne({ "_id": userID });
            await Tab.deleteMany({ "userID": userID });
            await List.deleteMany({ "userID": userID });
            await Task.deleteMany({ "userID": userID });
            await Fav.deleteOne({ userID });
            return res.status(200).json({ "message": "Votre compte a bien été supprimé" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ "errors": "Une erreur sur le serveur est survenue, réessayez ou contactez l'administrateur" });
    }
};

exports.updateUsername = async (req, res) => {
    const { username, userID } = req.body;
    const errors = validationResult(req);

    try {

        if (!errors.isEmpty()) {
            return res.status(422).json({ "errors": errors.array() });
        }

        const user = await User.updateOne({ "_id": userID }, { "username": username });

        if (!user.n) {
            return res.status(404).json({ "errors": "Pseudo introuvable" });
        }
        if (!user.nModified) {
            return res.status(400).json({ "errors": "Ce pseudo est déjà le vôtre ! " });
        }

        const currentUser = await User.findOne({ "_id": userID });

        currentUser.password = undefined;
        return res.status(200).json({ "message": `Votre pseudo a bien été modifié. Vous répondrez désormais sous le nom de ${username}`, "userData": currentUser });
    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            return res.status(422).json({ "errors": "Ce pseudo est déjà utilisé" });
        }
        return res.status(500).json({ "errors": "Erreur interne, contactez un administrateur" });
    }

};

exports.updateEmail = async (req, res) => {
    const { oldEmail, newEmail, userID } = req.body;
    const errors = validationResult(req);

    try {

        if (!errors.isEmpty()) {
            return res.status(422).json({ "errors": errors.array() });
        }

        const user = await User.findOne({ "email": oldEmail, "_id": userID });

        if (!user) {
            return res.status(404).json({ "errors": "L'email spécifié n'est rattaché à aucun compte." });
        }

        const mails = `${user.email} ${newEmail} ${userID}`;

        const encodedMails = encodeString(mails);

        const changeMailLink = `https://mymemento.fr/confirmation-mail-changement/${encodedMails}`; // TODO: Valeur prod à mettre

        const mailOptions = {
            "from": mailConfig.auth.user,
            "to": user.email,
            "subject": "Récupération de mot de passe",
            "html": `<body>` +
                `<h1>Bonjour ${user.username} !</h1>` +
                `<p> Vous avez fait une demande de changement d'email. Pour confirmer le changement, cliquez sur le lien ci-dessous </p>` +
                `<p> Si cette demande n'est pas de vous, ignorez simplement ce mail. </p>` +
                `<a href="${changeMailLink}" target="_blank">Je confirme mon changement de mail</a>` +
                `<footer>` +
                `<p> Cet email est un message automatique envoyé par mymemento.fr, merci de ne pas y répondre. </p>` +
                `</footer>` +
                `</body>`
        };

        const smtpTransport = mailer.createTransport(mailConfig);

        smtpTransport.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
                res.status(500).json({ "errors": "Echec de l'envoie de l'email." });
            } else {
                userChangeMailPending[userID] = { oldEmail, newEmail };
                setTimeout(() => {
                    delete userChangeMailPending[userID];
                }, 3600);
                res.status(200).json({ "message": "Un email vous a été envoyé sur votre ancienne addresse pour confirmation." });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ "errors": "Une erreur est survenue." });
    }
};

exports.newEmail = async (req, res) => {
    const { emails, userID } = req.body;
    const emailsArray = decodeString(emails).split(' ');

    const oldEmail = emailsArray[0].trim();
    const newEmail = emailsArray[1].trim();
    const userIDorigin = emailsArray[2].trim();

    console.log("emails décryptés", oldEmail, newEmail, userIDorigin);
    try {

        const user = await User.findOne({ "email": oldEmail, "_id": userIDorigin });

        if (!user) {
            return res.status(404).json({ "errors": "Aucun compte n'est lié à cet email" });
        }
        if (!userChangeMailPending[userID]) {
            return res.status(404).json({ "errors": "Aucune demande de changement de mail n'a été effectué par ce compte." });
        }
        user.email = newEmail;
        await user.save();

        delete userChangeMailPending[userID];
        res.status(200).json({ "message": "L'email a bien été modifié" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ "errors": "Une erreur est survenue, réessayez ou contactez un admin" });
    }


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

    const cleanToken = token.split('.').join('&'); // Problème avec React Router en laissant les points dans le token

    const recoveryLink = `https://mymemento.fr/nouveau-mot-de-passe/${cleanToken}`;

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
            userChangePassPending[user._id] = user;
            setTimeout(() => {
                delete userChangePassPending[user._id];
            }, 3600);
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

        const hash = await bcrypt.hash(pass, 10);

        const user = await User.findOne({ "_id": userID });

        if (hash) {
            await User.updateOne({ "_id": userID }, { "password": hash });
        } else {
            return res.status(500).json({ "errors": "Erreur serveur" });
        }

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

    } catch (e) {
        console.log(e);
        return res.status(401).json({ "errors": "Identité non vérifiée" });
    }
};

exports.updateTheme = async (req, res, next) => {
    const { theme, userID } = req.body;
    const token = req.headers.authorization.split(" ")[1];

    try {
        await User.updateOne({ "_id": userID }, { "mytheme": theme });

        const userdata = await User.findOne({ "_id": userID });

        return res.status(200).json({
            "userID": userdata._id,
            "username": userdata.username,
            "email": userdata.email,
            "mytheme": userdata.mytheme,
            token
        });
    } catch (err) {
        return res.status(500).json({ err, "errors": "Erreur interne" });
    }
};

exports.findUsers = async (req, res) => {
    const { userID, friendName } = req.body;

    try {
        const users = await User.find();
        const sortedUsers = users.filter((user) => user.username.toLowerCase().includes(friendName));

        if (!sortedUsers || sortedUsers.length === 0) {
            return res.status(200).json({ "users": [] });
        }

        const result = sortedUsers.filter((user) => {
            user.password = undefined;
            user.token = undefined;
            user.notifs = undefined;
            return user._id != userID;
        });

        const cryptedResult = await cryptUserData(result);

        return res.status(200).json({ "users": cryptedResult.cryptedData });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ e, "err": "Erreur interne, contactez un administrateur" });
    }
};
