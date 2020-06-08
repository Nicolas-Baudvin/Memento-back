const Fav = require("../Models/fav"),
    Tab = require("../Models/tab");

exports.newFav = async (req, res) => {
    const { tabId, userID, invitationLink, isInvited } = req.body;

    try {
        let favs = await Fav.findOne({ userID });

        if (!favs) {
            favs = new Fav({
                userID,
                "favTabs": [{ tabId, invitationLink, isInvited }]
            });

            await favs.save();

            return res.status(201).json({ favs });
        }

        favs.favTabs = [...favs.favTabs, { tabId, invitationLink, isInvited }];
        await favs.save();

        return res.status(200).json({ favs });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ e, "errors": "Erreur Serveur" });
    }


};

exports.deleteFav = async (req, res) => {
    const { tabId, userID } = req.body;

    try {
        const favs = await Fav.findOne({ userID });

        if (!favs) {
            return res.status(404);
        }

        favs.favTabs = favs.favTabs.filter((fav) => fav.tabId !== tabId);
        await favs.save();
    
        const newFavs = await Fav.findOne({ userID });

        res.status(200).json({ "favs": newFavs });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e, "errors": "Erreur Serveur" });
    }

};

exports.getFav = async (req, res) => {
    const { userID } = req.body;

    try {
        const favs = await Fav.findOne({ userID });

        if (!favs) {
            return res.status(204).json({ "favs": false });
        }

        return res.status(200).json({ favs });
    } catch (e) {
        res.status(500).json({ e, "errors": "Erreur Serveur" });
    }
};

exports.getFavTabs = async (req, res) => {
    const { userID, favsIds } = req.body;
    let tabs = [];

    if (favsIds.length === 0) {
        return res.status(200).json({ "tabs": false });
    }
    try {
        favsIds.forEach(async (element, index) => {
            const tab = await Tab.findOne({ "_id": element.tabId });

            tabs = [...tabs, tab];
            if (index === favsIds.length - 1) {
                return res.status(200).json({ tabs });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e, "errors": "Erreur Serveur" });
    }
    
};
