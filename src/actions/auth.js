'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
const helpersAuth = require('@serverRoot/helpers/auth');
const cryptoHash = require('@serverRoot/helpers/cryptoHash');
const validator = require('@serverRoot/helpers/validator');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// Permite acesso as rotas protegidas, analise das permissoes em um segundo momento
const logon = async (req, res) => {
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	const dataSession = sess[sessWraper];

	if (typeof dataSession === 'object' && dataSession !== null) {
		errWrapper.throwThis('AUTH', 400, 'Usuário já logado...');
	} else {
		let login = req.body.login,
			pass = req.body.pass;

		if (!validator.isEmpty(login)) {
			if (!validator.isEmpty(pass)) { // Inicia a sessao
				const query = {
					formato: 1,
					dados: {
						executar: `
							SELECT
								A.ID_USUARIO
								,A.NOME
								,A.EMAIL
								,A.SENHA
								,A.SALT
								,A.ATIVO
							FROM
								USUARIO A (NOLOCK)
								INNER JOIN TIPO B (NOLOCK)
									ON (A.ID_TIPO = B.ID_TIPO)
							WHERE
								A.EMAIL = '${login}';
						`
					}
				};

				let { recordsets: recordSets, ...resultSet } = await dbCon.msSqlServer.sqlExecuteAll(query),
					dataUser = resultSet && resultSet.rowsAffected[0] === 1 && resultSet.recordset[0],
					passCheck = (dataUser ? cryptoHash.hash(pass, dataUser.SALT) : undefined);

				if (passCheck && (passCheck.passHash === dataUser.SENHA)) {
					if (dataUser.ATIVO) {
						let id = dataUser.ID_USUARIO,
							nome = dataUser.NOME,
							email = dataUser.EMAIL;

						/* Session data */
						sess[sessWraper] = {
							id: id,
							nome: nome,
							email: email
						};
						/* Session data */
					} else {
						errWrapper.throwThis('AUTH', 400, 'Usuário inativo...');
					}
				} else {
					errWrapper.throwThis('AUTH', 400, 'Usuário ou senha inválidos...');
				}
			} else {
				errWrapper.throwThis('AUTH', 400, 'Favor preencher a senha...');
			}
		} else {
			errWrapper.throwThis('AUTH', 400, 'Favor preencher o usuário...');
		}
	}

	return sess[sessWraper];
};

// Finaliza a sessao no servidor, rotas protegidas ficam inascessiveis
const logout = (req, res) => {
	return new Promise((resolve, reject) => {
		const sess = req.session;

		sess.destroy (
			err => {
				try {
					if (err) {
						reject(err);
					} else {
						res.cookie(__serverConfig.server.session.cookieName, '', { expires: new Date() });
						resolve();
					}
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Verifica se a sessao esta ativa
const isLogged = async (req, res) => {
	let resultType = String(req.query.result_type),
		fRet = await helpersAuth.isLogged(req, (resultType === '1' ? 1 : 0));

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	logon,
	logout,
	isLogged
};
