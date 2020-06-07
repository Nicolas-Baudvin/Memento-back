const Task = require("../Models/task"),
    List = require("../Models/list"),
    { validationResult } = require("express-validator");

exports.find = async (req, res) => {
    const { tabId } = req.body;
    
    try {
        const tasks = await Task.find({ tabId });

        res.status(200).json({ tasks });
    } catch (e) {
        console.log(e);
    }

};

exports.create = async (req, res) => {
    const { title, tabId, listId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    const order = await Task.find({ listId });

    const newTask = new Task({
        title,
        listId,
        "order": order.length,
        tabId
    });

    newTask.save()
        .then(async () => {
            const tasks = await Task.find({ tabId });

            res.status(201).json({ tasks });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ err });
        });
};

exports.delete = async (req, res) => {
    const { userID, tabId, taskId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    try {
        const task = await Task.findOne({ "_id": taskId });
        const listId = task.listId;
        const deleted = await Task.deleteOne({ "_id": taskId });

        if (deleted.ok) {
            const tasks = await Task.find({ tabId });

            res.status(200).json({ tasks });
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ "errors": "Aucune carte trouvée", err });
    }

};

exports.updateName = async (req, res) => {
    const { title, taskId, tabId, userID } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    try {
        const task = await Task.updateOne({ "_id": taskId }, { title });
        const tasks = await Task.find({ tabId });

        res.status(200).json({ tasks, task });

    } catch (e) {
        console.log(e);
        res.status(404).json({ e, "errors": "Tâche introuvable" });
    }
};

exports.updateLabel = async (req, res) => {
    const { label, taskId, tabId, userID } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    try {
        const task = await Task.updateOne({ "_id": taskId }, { label });
        const tasks = await Task.find({ tabId });

        res.status(200).json({ tasks, task });

    } catch (e) {
        console.log(e);
        res.status(404).json({ e, "errors": "Tâche introuvable" });
    }

};

exports.updateOrder = async (req, res) => {
    const { userID, tasks, tabId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }
    try {
        tasks.forEach(async (task, index) => {
            await Task.updateOne({ "_id": task._id }, { ...task });
            if (index === tasks.length - 1) {
                const newTasks = await Task.find({ tabId });

                res.status(200).json({ "tasks": newTasks });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ e });
    }
};

exports.updateAssign = async (req, res) => {
    const { username, userID, taskId, tabId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ "errors": errors.array() });
    }

    try {
        await Task.updateOne({ "_id": taskId }, { "assigned": username });
        const tasks = await Task.find({ tabId });

        return res.status(200).json({ tasks });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ e, "errors": "Erreur serveur " });
    }
};
