const Fav = require("../Models/fav");
const Tab = require("../Models/tab");

exports.newFav = async (req, res) => {
    const { tabId, userID } = req.body;

    try {
        let favs = await Fav.findOne({ userID });

        if (!favs) {
            favs = await new Fav({
                userID,
                "favTabs": [tabId]
            });

            await favs.save();

            return res.status(201).json({ favs });
        }

        favs.favTabs = [...favs.favTabs, tabId];
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
            return res.status(404).json({ "fav": false });
        }

        const newFavs = favs.favTabs.filter((fav) => fav !== tabId);

        favs.favTabs = newFavs;

        await favs.save();

        res.status(200).json({ favs });
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
    const { userID, favsId } = req.body;
    let tabs = [];

    try {
        favsId.forEach(async (element, index) => {
            const tab = await Tab.findOne({ "_id": element });

            tabs = [...tabs, tab];
            if (index === favsId.length - 1) {
                console.log(tabs);
                res.status(200).json({ tabs });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e, "errors": "Erreur Serveur" });
    }
    
};
