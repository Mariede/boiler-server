'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se a rota e protegida com base nas informacoes de config
const isProtected = route => {
	return new Promise((resolve, reject) => {
		try {
			const exceptInspect = (paramTable, paramRoute) => {
				const routePrefix = (__serverConfig.server.routePrefix || '').replace(/\/+$/, '') + '/';

				return paramTable.some(
					element => {
						let elementPick = element.trim().toUpperCase().replace(/^\/+|\/+$/, ''),
							elementCheck = routePrefix + (elementPick !== '' ? elementPick + '/' : ''),
							regExCheck = new RegExp(elementCheck);

						return (elementCheck === routePrefix ? (elementCheck === paramRoute) : regExCheck.test(paramRoute));
					}
				);
			};

			let routeCheck = route.toUpperCase(),
				authTipo = __serverConfig.auth.authTipo,
				exceptTable = __serverConfig.auth.except,
				exceptReturn = exceptInspect(exceptTable, routeCheck),
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
const isLogged = (req, resType) => { // resType === 1 => retorna object. Default: retorna boolean.
	return new Promise((resolve, reject) => {
		try {
			let sess = req.session,
				sessWraper = __serverConfig.auth.sessWrapper,
				fRet = false;

			if (sess) {
				if (typeof sess[sessWraper] === 'object') {
					if (resType === 1) {
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
