const CryptoJS = require('crypto-js');

// Encrypt string
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET).toString();
};

// Decrypt string
const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.CRYPTO_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
