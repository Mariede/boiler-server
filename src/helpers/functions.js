'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const { format, isValid, parse } = require('date-fns');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica a data atual do servidor (formatado ou sem formatacao)
const getDateNow = formatted => {
	const formatLeftZeros = num => {
		return (`0${num}`).slice(-2);
	};

	let agora = new Date();

	if (formatted) {
		agora = `${formatLeftZeros(agora.getDate())}/${formatLeftZeros(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatLeftZeros(agora.getHours())}:${formatLeftZeros(agora.getMinutes())}:${formatLeftZeros(agora.getSeconds())}`;
	}

	return agora;
};

// Loop forEach assincrono
const asyncForEach = async (array, callback) => {
	for (let i = 0; i < array.length; i++) {
		const endThisLoopNow = await callback(array[i], i, array);

		if (endThisLoopNow) {
			break;
		}
	}
};

// Executa uma sequencia ordenada de promessas com uma array de itens como argumento de entrada
const promiseForEach = (arrayItems, callback) => {
	return arrayItems.reduce(
		(promise, item) => {
			return promise
			.then(
				() => {
					return callback(item);
				}
			)
			.catch(
				err => {
					throw err;
				}
			);
		},
		Promise.resolve()
	);
};

// Cria uma nova pasta no sistema de arquivos e executa o callback se existir
const createNewFolder = (fs, newFolder, callback) => {
	return new Promise((resolve, reject) => {
		const resolveThis = () => {
			if (callback) {
				resolve(callback());
			} else {
				resolve();
			}
		};

		fs.access(
			newFolder,
			fs.constants.F_OK, // Check if exists
			err => {
				try {
					if (err) {
						fs.mkdir(
							newFolder,
							err => {
								try {
									if (err) {
										if (err.code !== 'EEXIST') { // Check if exists (again)
											reject(err);
										} else {
											resolveThis();
										}
									} else {
										resolveThis();
									}
								} catch (err) {
									reject(err);
								}
							}
						);
					} else {
						resolveThis();
					}
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Le um arquivo e executa o callback se existir
const readFile = (fs, file, callback) => {
	return new Promise((resolve, reject) => {
		fs.readFile(
			file,
			'utf8',
			(err, data) => {
				try {
					if (err) {
						reject(err);
					} else {
						if (callback) {
							resolve(callback(data));
						} else {
							resolve(data);
						}
					}
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Escreve um arquivo e executa o callback se existir
const writeFile = (fs, file, content, callback) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(
			file,
			content,
			'utf8',
			err => {
				try {
					if (err) {
						reject(err);
					} else {
						if (callback) {
							resolve(callback());
						} else {
							resolve();
						}
					}
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Disparo de e-mails, via lib NODEMAILER
const sendMail = (transporter, content) => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(
			content,
			(sentErr, sentInfo) => {
				try {
					resolve({ sentErr, sentInfo });
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Verifica caracteres invalidos na criacao de pastas windows
//	os => sistema operacional: 1: windows
const removeInvalidFileNameChars = (_param, os = 1) => {
	let param = _param;

	switch (os) {
		case 1: {
			// Windows
			param = String(_param).replace(/[|&;$%@"<>()+,]/g, '');
			break;
		}
	}

	return param;
};

// Gera um identificador o mais unico possivel, em diferentes formatos
//	fullUnique => adiciona data completa e id do cluster (se existir)
const generateUniqueId = (_length, fullUnique = true) => {
	const length = (Number.isInteger(_length) && _length > 0 ? (_length < 15 ? _length : 15) : 1);

	let fRet = parseInt(((Math.random() * 9) + 1) * Math.pow(10, length - 1), 10);

	if (fullUnique) {
		const dateNow = (new Date()).toISOString().split('T');
		const dateLeft = (dateNow[0] || '').replace(/-/g, '');
		const dateRight = (dateNow[1] || '').replace(/[:.]/g, '').substr(0, 9);

		fRet = dateLeft + dateRight + (__serverWorker ? __serverWorker : '') + fRet.toString();
	}

	return fRet;
};

// Formata o numero de casas decimais de um numero float
const formatNumberDecimalsAfter = (value, decimalsAfter) => {
	if (typeof value === 'number') {
		const fatorDecimalsAfter = 10 ** decimalsAfter;

		return (
			Math.round(value * fatorDecimalsAfter) / fatorDecimalsAfter
		);
	}

	return value;
};

// Formata um numero valido para padrao brasileiro (com virgula)
const formatNumberToString = value => {
	if (typeof value === 'number') {
		return String(value).replace(/\./, ',');
	}

	return value;
};

// Formata uma data valida de acordo com o parametro de entrada
//	retorna o proprio valor de entrada se value nao for um objeto/data
const formatDateToString = (value, formatStyle = 'dd/MM/yyyy HH:mm:ss') => {
	if (value instanceof Date) {
		return format(value, formatStyle); // Retorna string
	}

	return value;
};

// Tenta formatar um valor em uma data valida de acordo com o parametro de entrada
//	retorna o proprio valor de entrada se data invalida
const formatStringToDate = (value, formatStyle = 'dd/MM/yyyy HH:mm:ss') => {
	if (typeof value === 'string') {
		const date = parse(
			value,
			formatStyle,
			new Date()
		);

		if (isValid(date)) {
			return date; // Retorna object/Date
		}
	}

	return value;
};

// Verifica se uma data valida esta futura a data de agora
//	Utiliza os GMTs definidos nos servidores abordados (node ou node / DB)
const checkDateAfterNow = value => {
	if (value instanceof Date) {
		const dateNow = new Date();

		if (value - dateNow > 0) {
			return true;
		}
	}

	return false;
};
// -------------------------------------------------------------------------

module.exports = {
	getDateNow,
	asyncForEach,
	promiseForEach,
	createNewFolder,
	readFile,
	writeFile,
	sendMail,
	removeInvalidFileNameChars,
	generateUniqueId,
	formatNumberDecimalsAfter,
	formatNumberToString,
	formatDateToString,
	formatStringToDate,
	checkDateAfterNow
};
