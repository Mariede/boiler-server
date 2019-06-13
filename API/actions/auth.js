'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const cryptoHash = require('@serverRoot/helpers/cryptoHash');
const errWrapper = require('@serverRoot/helpers/errWrapper');
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// Permite acesso as rotas protegidas, analise das permissoes em um segundo momento
const login = async (req, res) => {
	try {
		let sess = req.session,
			sessWraper = __serverConfig.auth.sessWrapper;

		if (sess[sessWraper]) {
			errWrapper.throwThis('AUTH', 400, 'Usuário já logado...');
		} else { // Inicia a sessao
			sess[sessWraper] = {};


/* login process - EM DESENVOLVIMENTO */
sess[sessWraper].id = 1;
sess[sessWraper].nome = 'João da Silva';
sess[sessWraper].email = 'joãosnow@provedor.com.br';
sess[sessWraper].senhaHash = await cryptoHash.hash('SenhaTeste123', 'dfdf');
sess[sessWraper].permissoes = ['LST_INFO1', 'EDT_INFO1', 'EXC_INFO2', 'LST_INFO3'];
/* login process - EM DESENVOLVIMENTO */


		}

		return sess[sessWraper];
	} catch(err) {
		throw err;
	}
};

// Finaliza a sessao no servidor, rotas protegidas ficam inascessiveis
const logout = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let sess = req.session,
				fRet = false;

			if (sess) {
				sess.destroy();
				res.cookie(__serverConfig.server.session.cookieName, '', { expires: new Date() });

				fRet = true;
			}

			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};

// Verifica se a sessao esta ativa
const isLogged = async (req, res) => {
	try {
		let fRet = await auth.isLogged(req, 2);
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	login,
	logout,
	isLogged
};
