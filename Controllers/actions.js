const Actions = require("../Models/actions");

exports.create = async (req, res) => {
    const { action, tabId, author, authorID, userID } = req.body;
    const newActions = new Actions({
        action,
        tabId,
        author,
        authorID
    });

    try {
        await newActions.save();
        const actions = await Actions.find({ tabId });

        res.status(200).json({ actions, newActions });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e, "errors": "Erreur serveur" });
    }
};

exports.find = async (req, res) => {
    const { tabId, userID } = req.body;

    try {
        const actions = await Actions.find({ tabId });
        
        res.status(200).json({ actions });
    } catch (e) {
        res.status(500).json({ e });
    }
};
