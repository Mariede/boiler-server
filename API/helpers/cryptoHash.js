"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const crypto = require('crypto');
// -------------------------------------------------------------------------

const checkSaltData = async (...saltData) => {
	try {
		const saltDataLen = saltData.length;
		let salt = '';

		switch (saltDataLen) {
			case 1: {
				salt = saltData[0]; // retorna o salt informado
				break;
			}
			case 2: {
				salt = await generateSalt(saltData[0], saltData[1]); // gera um salt novo e retorna
				break;
			}
		}

		return salt;
	} catch(err) {
		throw new Error(err);
	}
};

const generateSalt = (length, onlyNumbers = true) => {
	return new Promise((resolve, reject) => {
		try {
			let salt;

			if (onlyNumbers) {
				salt = parseInt(((Math.random() * 9) + 1) * Math.pow(10, length - 1), 10);
			} else {
				salt = crypto.randomBytes(length).toString('hex').slice(0, length);
			}

			resolve(salt);
		} catch(err) {
			reject(err);
		}
	});
};

const hash = async (passData, ...saltData) => {
	try {
		const algorithm = 'sha512';
		const pass = (passData || '') + '';
		const salt = await checkSaltData(...saltData);
 		const passHash = await crypto.createHmac(algorithm, salt).update(pass).digest('hex');

		return {
			pass: pass,
			salt: salt,
			passHash: passHash
		};
	} catch(err) {
		throw new Error(err);
	}
};

const baseCipherDecipher = async (passData, ...saltData) => {
	try {
		const scryptAsync = (passA, saltA, keyLenA) => {
			return new Promise((resolve, reject) => {
				try {
					crypto.scrypt(passA, saltA, keyLenA,
						(err, derivedKey) => {
							if (err) reject(err);
							resolve(derivedKey);
					});
				} catch(err) {
					reject(err);
				}
			});
		};

		const algorithm = 'aes-192-cbc';
		const algorithmKeyLen = 24; //algo 192: 24 bytes; algo 256: 32 bytes
		const pass = (passData || '') + '';
		const salt = await checkSaltData(...saltData);
		const key = await scryptAsync(pass, salt, algorithmKeyLen);
		const iv = await Buffer.alloc(16, 0);

		return {
			algorithm: algorithm,
			key: key,
			iv: iv
		};

	} catch(err) {
		throw new Error(err);
	}
};

// Exemplo cifragem: (mesma senha e salt)
// let cipher = await cryptoHash.cipher('aaaHsddsd33##', 'salt%123'),
// 	cifrado = await cipher.update('Powered By: * Michel Guimarães Ariede *', 'utf8', 'hex');
// cifrado += cipher.final('hex');
const cipher = async (passData, ...saltData) => {
	try {
		const baseCipher = await baseCipherDecipher(passData, ...saltData);
		const cipher = await crypto.createCipheriv(baseCipher.algorithm, baseCipher.key, baseCipher.iv);

		return cipher;
	} catch(err) {
		throw new Error(err);
	}
};

// Exemplo decifragem: (mesma senha e salt)
// let decipher = await cryptoHash.decipher('aaaHsddsd33##', 'salt%123'),
// 	decifrado = await decipher.update(cifrado, 'hex', 'utf8')
// decifrado += decipher.final('utf8');
const decipher = async (passData, ...saltData) => {
	try {
		const baseDecipher = await baseCipherDecipher(passData, ...saltData);
		const decipher = crypto.createDecipheriv(baseDecipher.algorithm, baseDecipher.key, baseDecipher.iv);

		return decipher;
	} catch(err) {
		throw new Error(err);
	}
};

module.exports = {
	generateSalt,
	hash,
	cipher,
	decipher
};
