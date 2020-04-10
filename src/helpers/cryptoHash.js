'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const crypto = require('crypto');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Retorna ou gera salt para tarefas (metodo privado)
const _checkSaltData = async (...saltData) => {
	const saltDataLen = saltData.length;

	let salt = '';

	switch (saltDataLen) {
		case 1: {
			salt = saltData[0].toString(); // Retorna o salt informado
			break;
		}
		case 2: {
			salt = await generateSalt(saltData[0], saltData[1]); // Gera um salt novo e retorna
			break;
		}
	}

	return salt;
};

// Base de codigo para cripto e decripto, baseado em algorithm (metodo privado)
const _baseCipherDecipher = async (passData, ...saltData) => {
	const scryptAsync = (passA, saltA, keyLenA) => {
		return new Promise((resolve, reject) => {
			try {
				crypto.scrypt(passA, saltA, keyLenA,
					(err, derivedKey) => {
						if (err) {
							reject(err);
						} else {
							resolve(derivedKey);
						}
					}
				);
			} catch (err) {
				reject(err);
			}
		});
	};

	const algorithm = __serverConfig.crypto.cipherAlgorithm;
	const algorithmKeyLen = __serverConfig.crypto.cipherKeyLen; // Detalhes => algo 192: 24 bytes; algo 256: 32 bytes
	const pass = String(passData || '');
	const salt = await _checkSaltData(...saltData);
	const key = await scryptAsync(pass, salt, algorithmKeyLen);
	const iv = await Buffer.alloc(16, 0);

	return {
		algorithm: algorithm,
		key: key,
		iv: iv
	};
};

// Gera novo salt com tamanho maximo e conteudo numerico ou alfanumerico
const generateSalt = (length, onlyNumbers = true) => {
	return new Promise((resolve, reject) => {
		try {
			let salt;

			if (onlyNumbers) {
				salt = functions.generateUniqueId(length, false).toString();
			} else {
				salt = crypto.randomBytes(length).toString('hex').slice(0, length);
			}

			resolve(salt);
		} catch (err) {
			reject(err);
		}
	});
};

/*
Gera um hash baseado em algorithm

	let passHash = await cryptoHash.hash('P@ssword123', 6, false);
*/
const hash = async (passData, ...saltData) => {
	const algorithm = __serverConfig.crypto.hashAlgorithm;
	const pass = String(passData || '');
	const salt = await _checkSaltData(...saltData);
	const passHash = await crypto.createHmac(algorithm, salt).update(pass).digest(__serverConfig.crypto.hashDigestEncoding);

	return {
		pass: pass,
		salt: salt,
		passHash: passHash
	};
};

/*
Exemplo cifragem: (mesma senha e salt)

	let cipher = await cryptoHash.cipher('aaaHsddsd33##', 'salt%123'),
		cifrado = await cipher.update('Powered By: * Michel Guimarães Ariede *', 'utf8', 'hex');
	cifrado += cipher.final('hex');
*/
const cipher = async (passData, ...saltData) => {
	const baseCipher = await _baseCipherDecipher(passData, ...saltData);
	const cipher = await crypto.createCipheriv(baseCipher.algorithm, baseCipher.key, baseCipher.iv);

	return cipher;
};

/*
Exemplo decifragem: (mesma senha e salt)

	let decipher = await cryptoHash.decipher('aaaHsddsd33##', 'salt%123'),
		decifrado = await decipher.update(cifrado, 'hex', 'utf8')
	decifrado += decipher.final('utf8');
*/
const decipher = async (passData, ...saltData) => {
	const baseDecipher = await _baseCipherDecipher(passData, ...saltData);
	const decipher = await crypto.createDecipheriv(baseDecipher.algorithm, baseDecipher.key, baseDecipher.iv);

	return decipher;
};
// -------------------------------------------------------------------------

module.exports = {
	generateSalt,
	hash,
	cipher,
	decipher
};
