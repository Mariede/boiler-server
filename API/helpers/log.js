'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log4js = require('log4js');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Logs no servidor usando log4js
const logger = (escopo, mensagem, incorporador = '') => {
	const myLogger = (incorporador ? log4js.getLogger(incorporador) : log4js.getLogger('default'));
	const worker = (__serverWorker ? 'ID ' + __serverWorker + ' => ' : '');

	mensagem = worker + mensagem;

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

// Retorna erro ao usuario via controller
const controllerErro = (res, err, escopo, incorporador = '') => {
	let httpStatusCode = 500,
		message = {};

	if (typeof err === 'object') {
		message = err;
		message.stackTrace = err.stack;

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
	}

	logger(escopo, err.stack || err, incorporador);
	res.status(httpStatusCode).send(message);
};
// -------------------------------------------------------------------------

module.exports = {
	logger,
	controllerErro
};
