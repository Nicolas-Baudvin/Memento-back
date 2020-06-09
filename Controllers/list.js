const List = require("../Models/list"),
    Task = require("../Models/task"),
    { validationResult } = require("express-validator");

exports.find = async (req, res) => {
    const { tabId } = req.body;

    const lists = await List.find({ "tabId": tabId });

    if (!lists) {
        return res.status(404).json({ "errors": "Listes introuvables" });
    }

    return res.status(200).json({ lists });

};

exports.create = (req, res) => {
    const { name, tabId, order } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const newList = new List({
        name,
        tabId,
        order
    });

    newList.save()
        .then(async (doc) => {
            console.log(doc);
            const lists = await List.find({ "tabId": tabId });

            res.status(201).json({ lists });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ err });
        });
};

exports.delete = async (req, res) => {
    const { userID, listID, tabId } = req.body;

    try {
        const listToDelete = await List.findOne({ "_id": listID });

        await List.deleteOne({ "_id": listID });
        await Task.deleteMany({ "listId": listID });

        const lists = await List.find({ "tabId": tabId });

        if (lists.length) {
            lists.forEach(async (item, index) => {
                console.log(item.order > listToDelete.order, item.order, listToDelete.order);
                if (item.order > listToDelete.order) {
                    await List.updateOne({ "_id": item._id }, { "order": item.order - 1 });
                }
                if (index === lists.length - 1) {
                    const updatedLists = await List.find({ "tabId": tabId });

                    return res.status(200).json({ "lists": updatedLists });
                }
            });
        }
        else {
            return res.status(200).json({ lists });
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ "errors": "Liste introuvable", err });
    }
};

exports.update = async (req, res) => {
    const { userID, tabId, listData } = req.body;

    try {
        await List.updateOne({ "_id": listData.list._id }, { "name": listData.newTitle });
        const lists = await List.find({ "tabId": tabId });

        res.status(200).json({ lists });
    } catch (err) {
        res.status(404).json({ "errors": "Liste introuvable", err });
    }

};

exports.updateOrder = async (req, res) => {
    const { userID, tabId, lists } = req.body;

    try {
        lists.forEach(async (list, index) => {
            await List.updateOne({ "_id": list._id }, { ...list });

            if (index === lists.length - 1) {
                const newLists = await List.find({ tabId });

                res.status(200).json({ "lists": newLists });
            }
        });


    } catch (e) {
        res.status(500).json({ e });
    }
};
