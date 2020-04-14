const Tab = require("../Models/tab");

exports.find = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(422).json({ "msg": "Id de la table non fourni" });
    }

    const tab = await Tab.findOne({ "_id": id });

    if (!tab) {
        return res.status(404).json({ "msg": "Table Introuvable" });
    }

    const { name, created_at, socketId, userID } = tab;

    res.status(200).json({ name, created_at, socketId, userID });
};

exports.create = async (req, res) => {
    const { userID, name, socket } = req.body;

    const date = new Date();
    const current = `créer le ${date.getDay()} ${date.getMonth()} ${date.getFullYear()} à ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    const newTab = new Tab({
        "name": name,
        "userID": userID,
        "created_at": current,
        "socketId": socket
    });

    newTab.save()
        .then(() => {
            res.status(201).json({ "msg": "Votre table a été créé", "tabData": { name, socket, userID, "created_at": current } });
        })
        .catch((err) => {
            res.status(500).json({ err, "msg": "Une erreur est survenue sur le serveur, réessayez ou contacter un administrateur" });
        });

};

exports.delete = (req, res) => {
    const { id } = req.body;

    Tab.deleteOne({
        "_id": id
    })
        .then(() => {
            res.status(200).json({ "msg": "La table a été supprimée" });
        })
        .catch((err) => {
            res.status(404).json({ "msg": "La table est introuvable", err });
        });
};

exports.update = (req, res) => {
    const { name, id, userID } = req.body;

    Tab.updateOne({ "_id": id }, { name })
        .then(() => {
            res.status(200).json({ "msg": "Table modifiée." });
        })
        .catch((err) => {
            res.status(404).json({ "msg": "la table est introuvable", err });
        });
};
