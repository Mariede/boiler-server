'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se a sessao esta ativa
const isLogged = (req, resType) => { // Se resType === 1 => retorna object. Default: retorna boolean.
	return new Promise((resolve, reject) => {
		try {
			let sess = req.session,
				sessWraper = __serverConfig.auth.sessWrapper,
				fRet = false;

			if (sess) {
				if (typeof sess[sessWraper] === 'object' && sess[sessWraper] !== null) {
					if (resType === 1) {
						fRet = sess[sessWraper];
					} else {
						fRet = true;
					}
				}
			}

			resolve(fRet);
		} catch (err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	isLogged
};
