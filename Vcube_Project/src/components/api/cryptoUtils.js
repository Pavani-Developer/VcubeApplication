import CryptoJS from 'crypto-js';

/**
 * Encrypt data using a provided key.
 * @param {string} data - The data to be encrypted.
 * @param {string} key - The encryption key.
 * @returns {string} - The encrypted data.
 */
export const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypt encrypted data using a provided key.
 * @param {string} encryptedData - The encrypted data.
 * @param {string} key - The encryption key.
 * @returns {string|null} - The decrypted data, or null if decryption fails.
 */
export const decryptData = (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};
