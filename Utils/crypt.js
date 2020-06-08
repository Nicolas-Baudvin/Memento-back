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

exports.cryptStringData = (string) => CryptoJS.AES.encrypt(string, process.env.SECRET_CRYPTO_KEY);

exports.decryptStringData = (cryptedString) => JSON.parse(CryptoJS.AES.decrypt(cryptedString, process.env.SECRET_CRYPTO_KEY).toString(CryptoJS.enc.Utf8));

exports.encodeString = (string) => {
    const encodedString = CryptoJS.enc.Utf8.parse(string);
    const encoded = CryptoJS.enc.Base64.stringify(encodedString);

    return encoded;
};

exports.decodeString = (encodedString) => {
    const encoded = CryptoJS.enc.Base64.parse(encodedString);
    const decoded = CryptoJS.enc.Utf8.stringify(encoded);

    return decoded;
};
