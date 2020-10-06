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
		const senha = req.body.senha;
		// -------------------------------------------------------------------------

		// Validacoes entrada
		if (!validator.isEmpty(login)) {
			if (!validator.isEmpty(senha)) {
				const query = {
					formato: 1,
					dados: {
						input: [
							['login', 'varchar(200)', login]
						],
						executar: `
							-- Dados de login e sessao do usuario
							SELECT
								A.ID_USUARIO id
								,A.NOME nome
								,A.EMAIL email
								,A.SENHA
								,A.SALT
								,A.ATIVO
							FROM
								USUARIO A (NOLOCK)
								INNER JOIN TIPO B (NOLOCK)
									ON (A.ID_TIPO = B.ID_TIPO)
							WHERE
								A.EMAIL = @login;

							SELECT
								B.ID_PERFIL id
								,B.PERFIL nome
							FROM
								PERFIL_USUARIO A (NOLOCK)
								INNER JOIN PERFIL B (NOLOCK)
									ON (A.ID_PERFIL = B.ID_PERFIL)
								INNER JOIN USUARIO C (NOLOCK)
									ON (A.ID_USUARIO = C.ID_USUARIO)
							WHERE
								C.EMAIL = @login;
							-- ----------------------------------------
						`
					}
				};

				const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
				const dataUser = resultSet && resultSet.rowsAffected[0] === 1 && resultSet.recordsets[0].pop();
				const senhaCheck = (dataUser ? cryptoHash.hash(senha, dataUser.SALT) : null);

				if (senhaCheck && (senhaCheck.passHash === dataUser.SENHA)) {
					if (dataUser.ATIVO) {
						// Limpa eventuais sessoes anteriores ativas para este usuario
						await helpersAuth.checkForLoggedSessions(req, dataUser.id);

						const perfis = (
							resultSet && resultSet.rowsAffected[1] !== 0 && resultSet.recordsets[1].map(
								_p => {
									return _p.nome;
								}
							)
						) || [];

						const funcoes = (
							resultSet && resultSet.rowsAffected[1] !== 0 && resultSet.recordsets[1].map(
								_f => {
									return _f.id;
								}
							)
						) || [];

						/* Session data */
						sess[sessWraper] = {
							id: dataUser.id,
							nome: dataUser.nome,
							email: dataUser.email,
							perfis: perfis,
							funcoes: funcoes
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
const logoff = (req, res) => {
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
	logoff,
	isLogged
};
