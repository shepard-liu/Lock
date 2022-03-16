const { scryptSync } = require('crypto');

/**
 * 
 * @param {string} password 
 * @param {string} salt 
 * @param {number} keyLen in bits
 * @returns {string} key buffer
 */
exports.scrypt = (password, salt, keyLen) => {
    if (typeof password !== 'string') throw new Error('Password should be a string.');
    if (typeof salt !== 'string') throw new Error('Salt should be a string.');
    if (keyLen !== 128 && keyLen != 192 && keyLen !== 256) throw new Error('Invalid KeyLen.');

    return scryptSync(password, salt, keyLen / 8, { N: 1024 });
}