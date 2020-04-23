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
	const dataSession = sess[sessWraper];

	let fRet = false;

	if (typeof dataSession === 'object' && dataSession !== null) {
		if (resType === 1) {
			fRet = dataSession;
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
