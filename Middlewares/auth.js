const jwt = require("jsonwebtoken");

/**
 * Middleware - Vérification du token utilisateur
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
        const userId = decodedToken.userID;
        const error = new Error("UserID Invalide");

        if ((req.body.userID || req.params.userID) && (req.body.userID || req.params.userID) !== userId) {
            throw error;
        } else {
            next();
        }
    } catch (err) {
        res.status(401).json({
            "errors": "Vous n'avez pas le droit d'accéder à cette url."
        });
    }
};
