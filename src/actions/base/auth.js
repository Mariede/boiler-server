'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const cryptoHash = require('@serverRoot/helpers/crypto-hash');
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const helpersAuth = require('@serverRoot/helpers/auth');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// Permite acesso as rotas protegidas, analise das permissoes em um segundo momento
const logon = async (req, res) => {
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;

	if (Object.prototype.hasOwnProperty.call(sess, sessWraper)) {
		errWrapper.throwThis('AUTH', 400, 'Usuário já logado...');
	} else {
		// Parametros de entrada
		const login = req.body.login;
		const pass = req.body.pass;
		// -------------------------------------------------------------------------

		// Validacoes entrada
		if (!validator.isEmpty(login)) {
			if (!validator.isEmpty(pass)) {
				const query = {
					formato: 1,
					dados: {
						input: [
							['login', 'varchar(200)', login]
						],
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
								A.EMAIL = @login;
						`
					}
				};

				const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
				const dataUser = resultSet && resultSet.rowsAffected === 1 && resultSet.recordset[0];
				const passCheck = (dataUser ? cryptoHash.hash(pass, dataUser.SALT) : null);

				if (passCheck && (passCheck.passHash === dataUser.SENHA)) {
					if (dataUser.ATIVO) {
						// Limpa eventuais sessoes anteriores ativas para este usuario
						await helpersAuth.checkForLoggedSessions(req, dataUser.ID_USUARIO);

						/* Session data */
						sess[sessWraper] = {
							id: dataUser.ID_USUARIO,
							nome: dataUser.NOME,
							email: dataUser.EMAIL,
							perfis: ['Administrador', 'supervisor'],
							funcoes: ['fn1', 'fn2', 'fn3', 'fn4']
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
		const sessWraper = __serverConfig.auth.sessWrapper;

		const sessionExists = Object.prototype.hasOwnProperty.call(sess, sessWraper);

		sess.destroy(
			err => {
				try {
					if (err) {
						reject(err);
					} else {
						res.cookie(__serverConfig.server.session.cookieName, '', { expires: new Date(0) });
						resolve(sessionExists);
					}
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Verifica se a sessao esta ativa
const isLogged = (req, res) => {
	const resultType = (req.query.result_type || '');
	const fRet = helpersAuth.isLogged(req, (resultType === '1' ? 1 : 0));

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	logon,
	logout,
	isLogged
};
