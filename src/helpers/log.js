'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log4js = require('log4js');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Logs no servidor usando log4js
const logger = (escopo, _mensagem, incorporador = '') => {
	const myLogger = (incorporador ? log4js.getLogger(incorporador) : log4js.getLogger('default'));
	const mensagem = (__serverWorker ? `Trabalhador ${__serverWorker} => ` : '') + _mensagem;

	switch (escopo) {
		case 'fatal': {
			if (myLogger.isFatalEnabled()) {
				myLogger.fatal(mensagem);
			}
			break;
		}
		case 'error': {
			if (myLogger.isErrorEnabled()) {
				myLogger.error(mensagem);
			}
			break;
		}
		case 'warn': {
			if (myLogger.isWarnEnabled()) {
				myLogger.warn(mensagem);
			}
			break;
		}
		case 'info': {
			if (myLogger.isInfoEnabled()) {
				myLogger.info(mensagem);
			}
			break;
		}
		case 'debug': {
			if (myLogger.isDebugEnabled()) {
				myLogger.debug(mensagem);
			}
			break;
		}
		case 'trace': {
			if (myLogger.isTraceEnabled()) {
				myLogger.trace(mensagem);
			}
			break;
		}
		default: {
			myLogger.log(mensagem);
		}
	}
};

// Retorna erros oriundos dos controllers ao usuario
const errorsController = (res, err, escopo, incorporador = '') => {
	const checkCustomErrors = () => {
		/*
		Erros customizados, definidos no config
			=> chave server.customErrors e uma array de objetos
			=> formato do objeto para verificacao { message: '', customMessage: '' }
			=> message pode ser parcial
			=> customMessage e a mensagem de erro customizada
		*/
		const customErrors = __serverConfig.server.customErrors;

		if (Array.isArray(customErrors)) {
			if (typeof err.message === 'string') {
				const findCustomError = customErrors.find(
					element => {
						return (
							err.message.includes(element.message)
						);
					}
				);

				if (findCustomError && error.message) {
					error.customMessage = findCustomError.customMessage;
				}
			} else {
				if (Array.isArray(err.message)) {
					let customErrorsFound = 0;

					const findCustomErrors = err.message.map(
						errorMessageItem => {
							const findCustomError = customErrors.find(
								element => {
									return (
										errorMessageItem.includes(element.message)
									);
								}
							);

							if (findCustomError) {
								customErrorsFound = customErrorsFound + 1;
								return findCustomError.customMessage;
							}

							return errorMessageItem;
						}
					);

					if (customErrorsFound && error.message) {
						error.customMessage = findCustomErrors;
					}
				}
			}
		}
	};

	const error = new Error();
	const genericErrorName = 'Error';

	let httpStatusCode = 500;

	switch (typeof err) {
		case 'object': {
			if (err.name) {
				error.name = err.name;
			} else {
				error.name = genericErrorName;
			}

			if (err.code) {
				error.code = err.code;

				switch (err.code) {
					case 400:
					case 401:
					case 403:
					case 404:
					case 405:
					case 501:
					case 502:
					case 503: {
						httpStatusCode = err.code;
						break;
					}
				}
			} else {
				error.code = httpStatusCode;
			}

			if (err.message) {
				error.message = err.message;
			} else {
				error.message = '';
			}

			if (err.stack && __serverConfig.server.showFrontEndStackTraceErr) {
				error.stackTrace = err.stack;
			}

			break;
		}
		default: {
			error.name = genericErrorName;
			error.code = httpStatusCode;
			error.message = err;

			if (__serverConfig.server.showFrontEndStackTraceErr) {
				error.stackTrace = error.stack;
			}
		}
	}

	// Verifica por erros customizados no config
	checkCustomErrors();

	logger(escopo, err.stack || err, incorporador);
	res.status(httpStatusCode).send(error);
};
// -------------------------------------------------------------------------

module.exports = {
	logger,
	errorsController
};
