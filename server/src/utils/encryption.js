const CryptoJS = require('crypto-js');

const MAX_PLAINTEXT_LENGTH = 12 * 1024 * 1024;

const encrypt = (text) => {
  if (typeof text !== 'string') {
    throw new Error('Contenu de message invalide');
  }
  if (text.length > MAX_PLAINTEXT_LENGTH) {
    throw new Error('Message trop volumineux');
  }
  const secret = process.env.CRYPTO_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('Configuration de chiffrement invalide');
  }
  return CryptoJS.AES.encrypt(text, secret).toString();
};

const decrypt = (ciphertext) => {
  if (ciphertext == null || ciphertext === '') {
    return '';
  }
  if (typeof ciphertext !== 'string') {
    return '[message indisponible]';
  }
  const secret = process.env.CRYPTO_SECRET;
  if (!secret || secret.length < 16) {
    return '[message indisponible]';
  }
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    const out = bytes.toString(CryptoJS.enc.Utf8);
    if (!out) {
      return '[message non lisible]';
    }
    return out;
  } catch (e) {
    console.error('[decrypt] echec de dechiffrement');
    return '[message non lisible]';
  }
};

module.exports = { encrypt, decrypt, MAX_PLAINTEXT_LENGTH };
