"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se a rota e protegida com base nas informacoes de config
const isProtected = (req, rota) => {
	let rotaCheck = rota.toUpperCase(),
		authTipo = __serverConfig.auth.authTipo,
		exceptTable = __serverConfig.auth.except,
		exceptInspect = (paramTable, paramRota) => {
			return paramTable.some(
				(element) => {
					let elementCheck = element.trim().toUpperCase().replace(/[/]+$/, '') + '/',
						regExCheck = new RegExp(elementCheck);

					return (elementCheck === '/' ? (elementCheck === paramRota) : regExCheck.test(paramRota));
				}
			);
		},
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

	return fRet;
};

// Permite acesso as rotas protegidas, analise das permissoes em um segundo momento
const login = (req) => {
	let sess = req.session,
		sessWraper = __serverConfig.auth.sessWrapper;

	if (sess[sessWraper]) {
		throw new Error('Usuário já logado');
	} else { // Inicia a sessao
		sess[sessWraper] = {};


/* login process - EM DESENVOLVIMENTO */
sess[sessWraper].id = 1;
sess[sessWraper].nome = 'João da Silva';
sess[sessWraper].email = 'joãosnow@provedor.com.br';
sess[sessWraper].permissoes = ['LST_INFO1', 'EDT_INFO1', 'EXC_INFO2', 'LST_INFO3'];
/* login process - EM DESENVOLVIMENTO */


	}

	return sess[sessWraper];
};

// Finaliza a sessao no servidor, rotas protegidas ficam inascessiveis
const logout = (req, res) => {
	let sess = req.session,
		fRet = false;

	if (sess) {
		sess.destroy();
		res.cookie(__serverConfig.server.session.cookieName, '', { expires: new Date() });

		fRet = true;
	}

	return fRet;
};

// Verifica se a sessao esta ativa
const isLogged = (req, retType) => { // retType: 2: retorna object. Default: retorna boolean.
	let sess = req.session,
		sessWraper = __serverConfig.auth.sessWrapper,
		fRet = false;

	if (sess) {
		if (sess[sessWraper]) {
			if (sess[sessWraper].id) {
				if (retType === 2) {
					fRet = sess[sessWraper];
				} else {
					fRet = true;
				}
			}
		}
	}

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	isProtected,
	login,
	logout,
	isLogged
};
