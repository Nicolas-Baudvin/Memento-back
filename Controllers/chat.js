const Message = require("../Models/message");

exports.find = async (req, res) => {
    const { tabId, userID } = req.body;

    try {
        const messages = await Message.find({ tabId });
        
        res.status(200).json({ messages });
    } catch (e) {
        res.status(500).json({ e });
    }
};
