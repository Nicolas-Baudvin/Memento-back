const { validationResult } = require("express-validator");
const Tab = require("../Models/tab");
const List = require("../Models/list");
const Task = require("../Models/task");
const Action = require("../Models/actions");

exports.find = async (req, res) => {
    const { id } = req.params;
    const tabs = await Tab.find({ "userID": id });

    if (!tabs) {
        return res.status(404).json({ "errors": "Table Introuvable" });
    }

    res.status(200).json({ "tabs": [...tabs] });
};

exports.create = async (req, res) => {
    const { userID, name, imgPath } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const date = new Date();
    const current = `créer le ${date.getDay()} ${date.getMonth()} ${date.getFullYear()} à ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    const newTab = new Tab({
        "name": name,
        "userID": userID,
        "created_at": current,
        imgPath
    });

    newTab.save()
        .then(async () => {
            const userTabs = await Tab.find({ "userID": userID });

            if (userTabs) {
                return res.status(201).json({ "msg": "Votre table a été créé", "tabs": userTabs });
            }

            res.status(201).json({ "msg": "Votre table a été créé", "tab": { name, "created_at": current, imgPath } });
        })
        .catch((err) => {
            res.status(500).json({ err, "errors": "Une erreur est survenue sur le serveur, réessayez ou contacter un administrateur" });
        });

};

exports.delete = async (req, res) => {
    const { tabId, userID } = req.body;

    Tab.deleteOne({
        "_id": tabId,
        userID
    })
        .then(async () => {

            const userTabs = await Tab.find({ "userID": userID });

            if (!userTabs) {
                return res.status(404).json({ "errors": "Aucune table trouvée sur le serveur" });
            }

            try {

                await List.deleteMany({ tabId });
                await Task.deleteMany({ tabId });
                await Action.deleteMany({ tabId });
                res.status(200).json({ "msg": "La table a été supprimée", "tabs": userTabs });
            } catch (e) {
                res.status(500).json({ e, "errors": "Erreur serveur" });
            }
        })
        .catch((err) => {
            res.status(404).json({ "errors": "La table est introuvable", err });
        });
};

exports.updateName = (req, res) => {
    const { name, tabId, userID } = req.body;

    Tab.updateOne({ "_id": tabId }, { name })
        .then(() => {
            res.status(200).json({ "msg": "Table modifiée." });
        })
        .catch((err) => {
            res.status(404).json({ "errors": "la table est introuvable", err });
        });
};

exports.updatePic = (req, res) => {
    const { imgPath, tabId, userID } = req.body;

    Tab.updateOne({ "_id": tabId }, { imgPath })
        .then(() => {
            res.status(200).json({ "msg": "Table modifiée." });
        })
        .catch((err) => {
            res.status(404).json({ "errors": "la table est introuvable", err });
        });
};
