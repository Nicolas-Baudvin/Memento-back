const { validationResult } = require("express-validator"),
    Tab = require("../Models/tab"),
    List = require("../Models/list"),
    Task = require("../Models/task"),
    Action = require("../Models/actions"),
    Message = require("../Models/message");

exports.find = async (req, res) => {
    const { "id": userID } = req.params;

    try {

        const tabs = await Tab.find({ userID });
        
        if (!tabs) {
            return res.status(404).json({ "errors": "Table Introuvable" });
        }
        
        res.status(200).json({ "tabs": [...tabs] });
    } catch (e) {
        res.status(500).json({ e });
    }
};

exports.create = async (req, res) => {
    const { userID, name, imgPath, owner, resizedImgPath } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const newTab = new Tab({
        "name": name,
        "userID": userID,
        owner,
        imgPath,
        resizedImgPath
    });

    try {
        await newTab.save();
        const userTabs = await Tab.find({ "userID": userID });

        if (userTabs) {
            return res.status(201).json({ "msg": "Votre tableau a été créé", "tabs": userTabs });
        }

        res.status(201).json({ "msg": "Votre tableau a été créé", "tab": { name, "created_at": current, imgPath } });
    } catch (err) {
        return res.status(500).json({ err, "errors": "Une erreur est survenue sur le serveur, réessayez ou contacter un administrateur" });
    }
};

exports.delete = async (req, res) => {
    const { tabId, userID } = req.body;

    try {
        await Tab.deleteOne({
            "_id": tabId,
            userID
        });

        const userTabs = await Tab.find({ "userID": userID });

        if (!userTabs) {
            return res.status(404).json({ "errors": "Le tableau que vous essayez de supprimer n'existe pas." });
        }

        try {

            await List.deleteMany({ tabId });
            await Task.deleteMany({ tabId });
            await Action.deleteMany({ tabId });
            await Message.deleteMany({ tabId });
            return res.status(200).json({ "msg": "Le tableau a été supprimé", "tabs": userTabs });
        } catch (err) {
            return res.status(500).json({ err, "errors": "Erreur serveur" });
        }

    } catch (err) {
        return res.status(500).json({ err, "errors": "Erreur serveur" });
    }
};

exports.updateName = async (req, res) => {
    const { name, tabId } = req.body;

    try {
        await Tab.updateOne({ "_id": tabId }, { name });
        const tab = await Tab.findOne({ "_id": tabId });

        res.status(200).json({ tab });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e, "errors": "Erreur serveur" });
    }
};

exports.updatePic = async(req, res) => {
    const { imgPath, tabId } = req.body;

    try {
        await Tab.updateOne({ "_id": tabId }, { imgPath });
        const tab = await Tab.findOne({ "_id": tabId });

        console.log(tab);
        res.status(200).json({ tab });
    } catch (e) {
        res.status(500).json({ e, "errors": "Erreur serveur" });
    }
};

exports.publicTab = async (req, res) => {
    const { tabId } = req.body;

    try {
        const tab = await Tab.findOne({ "_id": tabId });

        if (!tab.isPublic) {
            return res.status(403).json({ "errors": "Cette table n'est pas publique" });
        }

        if (!tab) {
            return res.status(204).json({ "tab": false });
        }

        const lists = await List.find({ "tabId": tab._id });

        if (!lists) {
            return res.status(200).json({ tab, "lists": [], "tasks": [] });
        }
        const tasks = await Task.find({ "tabId": tab._id });

        if (!tasks) {
            return res.status(200).json({ tab, lists, "tasks": [] });
        }
        return res.status(200).json({ tab, lists, tasks });
    } catch (e) {
        console.log(e);
        res.status(500).json({ "errors": "Erreur interne. Contactez un administrateur" });
    }
};

exports.changeTabStatus = async (req, res) => {
    const { tabId, isPublic } = req.body;

    try {
        await Tab.updateOne({ "_id": tabId }, { "isPublic": isPublic });
        const tab = await Tab.findOne({ "_id": tabId });
        
        if (!tab) {
            res.status(404).json({ "errors": "Aucune table trouvée" });
        }
        return res.status(200).json({ tab });
    } catch (e) {
        return res.status(500).json({ "errors": "Erreur interne. Contactez un administrateur" });
    }
};
