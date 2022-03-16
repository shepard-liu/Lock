const aesjs = require('aes-js');
const { scrypt } = require('./pbkdf');
const { getRandomBytes, concatUint8Arrays, sliceArrayByLength } = require('./utils');


exports.ctrEncrypt = (password, data) => {
    // Validate
    if (!Buffer.isBuffer(data)) throw new Error('Invalid data to encrypt');

    // Generate a random salt string of 32 bytes
    const salt = getRandomBytes(32);

    // Generate Key from password and salt
    const key = scrypt(password, Buffer.from(salt.buffer).toString(), 256);

    // Generate random counter
    const counter = getRandomBytes(16);

    // Create an encrytor instance
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, counter);

    // Do the encryption
    const dataEncrypted = aesCtr.encrypt(new Uint8Array(data));

    // Concat the salt, counter and encrypted data
    return Buffer.from(concatUint8Arrays(salt, counter, dataEncrypted).buffer);

}

exports.ctrDecrypt = (password, data) => {
    // Validate    
    if (!Buffer.isBuffer(data)) throw new Error('Invalid data to decrypt');

    // Read the counter bytes from the encrypted data 
    const [salt, counter, encrytedData] = sliceArrayByLength(data, 32, 16);

    // Generate Key from password and salt
    const key = scrypt(password, salt.toString(), 256);

    // Create an encrytor instance
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, counter);

    // Do the decryption
    const dataDecrypted = aesCtr.decrypt(encrytedData);

    // Concat the counter and encrypted data
    return Buffer.from(dataDecrypted.buffer);
}