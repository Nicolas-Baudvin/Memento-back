const CryptoJS = require("crypto-js");

/**
 * @param {Object} dataToDecrypt
 */
exports.decryptUserData = (dataToDecrypt) => {
    return new Promise((resolve, reject) => {
        if (!dataToDecrypt || typeof dataToDecrypt === "undefined" || dataToDecrypt === null) {
            return reject({ "err": "type Object Attendu" });
        }
        const bytes = CryptoJS.AES.decrypt(dataToDecrypt, process.env.SECRET_CRYPTO_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        resolve({ decryptedData });
    });
};

/**
 * @param {Object} dataToEncrypt
 */
exports.cryptUserData = (dataToEncrypt) => {
    return new Promise((resolve, reject) => {
        if (!dataToEncrypt || typeof dataToEncrypt === "undefined" || dataToEncrypt === null) {
            return reject({ "err": "type String Attendu" });
        }
        const cryptedData = CryptoJS.AES.encrypt(JSON.stringify(dataToEncrypt), process.env.SECRET_CRYPTO_KEY).toString();

        resolve({ cryptedData });
    });
};
