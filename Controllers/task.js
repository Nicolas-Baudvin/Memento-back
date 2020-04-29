const Task = require("../Models/task");
const { validationResult } = require("express-validator");

exports.find = async (req, res) => {
    const { tabId } = req.body;

    const tasks = await Task.find({ tabId });

    res.status(200).json({ tasks });
};

exports.create = async (req, res) => {
    const { title, tabId, listId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const order = await Task.find({ listId }).length;

    const newTask = new Task({
        title,
        listId,
        order,
        tabId
    });

    newTask.save()
        .then(async () => {
            const tasks = await Task.find({ tabId });

            res.status(201).json({ tasks });
        })
        .catch((err) => {
            res.status(400).json({ err });
        });
};

exports.delete = (req, res) => {

};

exports.update = (req, res) => {

};
