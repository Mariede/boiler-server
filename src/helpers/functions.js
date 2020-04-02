'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica a data atual do servidor (formatado ou sem formatacao)
const getDateNow = formatted => {
	try {
		const formatLeftZeros = num => {
			return ('0' + num).slice(-2);
		};

		let agora = new Date();

		if (formatted) {
			agora = `${formatLeftZeros(agora.getDate())}/${formatLeftZeros(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatLeftZeros(agora.getHours())}:${formatLeftZeros(agora.getMinutes())}:${formatLeftZeros(agora.getSeconds())}`;
		}

		return agora;
	} catch (err) {
		throw err;
	}
};

// Loop forEach assincrono
const asyncForEach = async (array, callback) => {
	try {
		for (let i = 0; i < array.length; i++) {
			let endThisLoopNow = await callback(array[i], i, array);

			if (endThisLoopNow) {
				break;
			}
		}
	} catch (err) {
		throw err;
	}
};

// Executa uma sequencia ordenada de promessas com uma array de itens como argumento de entrada
const promiseForEach = (arrayItems, callback) => {
	try {
		return arrayItems.reduce (
			(promise, item) => {
				return promise
				.then (
					() => {
						return callback(item);
					}
				)
				.catch (
					err => {
						throw err;
					}
				);
			},
			Promise.resolve()
		);
	} catch (err) {
		throw err;
	}
};

// Cria uma nova pasta no sistema de arquivos
const createNewFolder = (fs, newFolder) => {
	return new Promise((resolve, reject) => {
		try {
			fs.access (
				newFolder,
				fs.constants.F_OK, // Check if exists
				err => {
					try {
						if (err) {
							fs.mkdir (
								newFolder,
								err => {
									try {
										if (err) {
											if (err.code !== 'EEXIST') { // Check if exists (again)
												reject(err);
											} else {
												resolve();
											}
										} else {
											resolve();
										}
									} catch (err) {
										reject(err);
									}
								}
							);
						} else {
							resolve();
						}
					} catch (err) {
						reject(err);
					}
				}
			);
		} catch (err) {
			reject(err);
		}
	});
};

// Verifica caracteres invalidos na criacao de pastas windows
//    os => sistema operacional: 1: windows
const removeInvalidFileNameChars = (_param, os = 1) => {
	try {
		let param = _param;

		switch (os) {
			case 1: {
				// Windows
				param = String(_param).replace(/[|&;$%@"<>()+,]/g, '');
				break;
			}
		}

		return param;
	} catch (err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	getDateNow,
	asyncForEach,
	promiseForEach,
	createNewFolder,
	removeInvalidFileNameChars
};
