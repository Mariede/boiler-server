'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se a rota e protegida com base nas informacoes de config
const isProtected = rota => {
	return new Promise((resolve, reject) => {
		try {
			const exceptInspect = (paramTable, paramRota) => {
				return paramTable.some(
					element => {
						let elementCheck = element.trim().toUpperCase().replace(/[/]+$/, '') + '/',
							regExCheck = new RegExp(elementCheck);

						return (elementCheck === '/' ? (elementCheck === paramRota) : regExCheck.test(paramRota));
					}
				);
			};

			let rotaCheck = rota.toUpperCase(),
				authTipo = __serverConfig.auth.authTipo,
				exceptTable = __serverConfig.auth.except,
				exceptReturn = exceptInspect(exceptTable, rotaCheck),
				fRet = true; // Rota protegida inicialmente

			if (authTipo === 2) {
				if (!exceptReturn) {
					fRet = false;
				}
			} else {
				if (exceptReturn) {
					fRet = false;
				}
			}

			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};

// Verifica se a sessao esta ativa
const isLogged = (req, retType) => { // retType: 2: retorna object. Default: retorna boolean.
	return new Promise((resolve, reject) => {
		try {
			let sess = req.session,
				sessWraper = __serverConfig.auth.sessWrapper,
				fRet = false;

			if (sess) {
				if (typeof sess[sessWraper] === 'object') {
					if (retType === 2) {
						fRet = sess[sessWraper];
					} else {
						fRet = true;
					}
				}
			}

			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	isProtected,
	isLogged
};
