'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se a sessao esta ativa
const isLogged = (req, resType) => { // Se resType === 1 => retorna object. Default: retorna boolean.
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;

	let fRet = false;

	if (Object.prototype.hasOwnProperty.call(sess, sessWraper)) {
		if (resType === 1) {
			fRet = sess[sessWraper];
		} else {
			fRet = true;
		}
	}

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	isLogged
};
