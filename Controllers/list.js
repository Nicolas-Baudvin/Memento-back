const List = require("../Models/list");
const { validationResult } = require("express-validator");

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
            const lists = await List.find({"tabId": tabId });
            
            res.status(201).json({ lists });
            
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ err });
        });



};

exports.delete = (req, res) => {

};

exports.update = (req, res) => {

};
