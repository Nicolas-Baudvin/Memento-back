const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const token = authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_PUBLIC_KEY);
        const userId = decoded.userId;

        if (req.body.userId && req.body.userId !== userId) {
            throw Error("Id utilisateur invalide");
        } else {
            next();
        }

    } 
    catch {
        return res.status(401).json({ "message": "Accès refusé" });
    }
};
