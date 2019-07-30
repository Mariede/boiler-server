'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const auth = require('@serverRoot/helpers/auth');
const cryptoHash = require('@serverRoot/helpers/cryptoHash');
const validator = require('@serverRoot/helpers/validator');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// Permite acesso as rotas protegidas, analise das permissoes em um segundo momento
const login = async (req, res) => {
	try {
		let sess = req.session,
			sessWraper = __serverConfig.auth.sessWrapper;

		if (typeof sess[sessWraper] === 'object') {
			errWrapper.throwThis('AUTH', 400, 'Usuário já logado...');
		} else {
			let login = req.body.login,
				pass = req.body.pass;

			if (!validator.isEmpty(login)) {
				if (!validator.isEmpty(pass)) { // Inicia a sessao
					sess[sessWraper] = {};



					/* login process - ACESSO AO DB */
					sess[sessWraper].id = 1;
					sess[sessWraper].login = login.trim();
					sess[sessWraper].senhaHash = await cryptoHash.hash(pass, '123Abc');
					sess[sessWraper].permissoes = ['LST_INFO1', 'EDT_INFO1', 'EXC_INFO2', 'LST_INFO3'];
					/* login process - ACESSO AO DB */



				} else {
					errWrapper.throwThis('AUTH', 400, 'Favor preencher a senha...');
				}
			} else {
				errWrapper.throwThis('AUTH', 400, 'Favor preencher o login...');
			}
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
