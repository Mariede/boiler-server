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
const _checkSaltData = (...saltData) => {
	const saltDataLen = saltData.length;

	let salt = '';

	switch (saltDataLen) {
		case 1: {
			salt = saltData[0].toString(); // Retorna o salt informado
			break;
		}
		case 2: {
			salt = generateSalt(saltData[0], saltData[1]); // Gera um salt novo e retorna
			break;
		}
	}

	return salt;
};

// Base de codigo para cripto e decripto, baseado em algorithm (metodo privado)
const _baseCipherDecipher = async (passData, ...saltData) => {
	const scryptAsync = (_pass, _salt, _algorithmKeyLen) => {
		return new Promise((resolve, reject) => {
			crypto.scrypt (
				_pass,
				_salt,
				_algorithmKeyLen,
				(err, derivedKey) => {
					try {
						if (err) {
							reject(err);
						} else {
							resolve(derivedKey);
						}
					} catch (err) {
						reject(err);
					}
				}
			);
		});
	};

	const algorithm = __serverConfig.crypto.encryptAlgorithm;
	const algorithmKeyLen = __serverConfig.crypto.encryptKeyLen; // Detalhes => algo 192: 24 bytes; algo 256: 32 bytes
	const pass = String(passData || '');
	const salt = _checkSaltData(...saltData);
	const key = await scryptAsync(pass, salt, algorithmKeyLen);
	const iv = Buffer.alloc(16, 0);

	return {
		algorithm: algorithm,
		key: key,
		iv: iv
	};
};

// Gera novo salt com tamanho maximo e conteudo numerico ou alfanumerico
const generateSalt = (length, onlyNumbers = true) => {
	let salt;

	if (onlyNumbers) {
		salt = functions.generateUniqueId(length, false).toString();
	} else {
		salt = crypto.randomBytes(length).toString('hex').slice(0, length);
	}

	return salt;
};

/*
Gera um hash baseado em algorithm

	const passHash = cryptoHash.hash('P@ssword123', 6, false);

	* passData e saltData opcionais
*/
const hash = (passData, ...saltData) => {
	const algorithm = __serverConfig.crypto.hashAlgorithm;
	const pass = String(passData || '');
	const salt = _checkSaltData(...saltData);
	const passHash = crypto.createHmac(algorithm, salt).update(pass).digest(__serverConfig.crypto.hashDigestEncoding);

	return {
		pass: pass,
		salt: salt,
		passHash: passHash
	};
};

/*
Exemplo cifragem: (mesma senha e salt)

	const encrypted = await cryptoHash.cipher('Powered By: -> * Michel Guimarães Ariede * <-', 'aaaHsddsd33##', 'salt%123');

	* passData e saltData opcionais
*/
const cipher = async (textToCipher, passData, ...saltData) => {
	const baseCipher = await _baseCipherDecipher(passData, ...saltData);
	const cipher = crypto.createCipheriv(baseCipher.algorithm, baseCipher.key, baseCipher.iv);
	const inputEncoding = __serverConfig.crypto.encryptInputEncoding;
	const outputEncoding = __serverConfig.crypto.encryptOutputEncoding;

	let encrypted = cipher.update(textToCipher, inputEncoding, outputEncoding);
	encrypted += cipher.final(outputEncoding);

	return encrypted;
};

/*
Exemplo decifragem: (mesma senha e salt)

	const decrypted = await cryptoHash.decipher(encrypted, 'aaaHsddsd33##', 'salt%123');

	* passData e saltData opcionais
*/
const decipher = async (textToDecipher, passData, ...saltData) => {
	const baseDecipher = await _baseCipherDecipher(passData, ...saltData);
	const decipher = crypto.createDecipheriv(baseDecipher.algorithm, baseDecipher.key, baseDecipher.iv);
	const inputEncoding = __serverConfig.crypto.encryptInputEncoding;
	const outputEncoding = __serverConfig.crypto.encryptOutputEncoding;

	let decrypted = decipher.update(textToDecipher, outputEncoding, inputEncoding);
	decrypted += decipher.final(inputEncoding);

	return decrypted;
};
// -------------------------------------------------------------------------

module.exports = {
	generateSalt,
	hash,
	cipher,
	decipher
};
