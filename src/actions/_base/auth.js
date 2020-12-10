'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const cryptoHash = require('@serverRoot/helpers/crypto-hash');
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const functions = require('@serverRoot/helpers/functions');
const helpersAuth = require('@serverRoot/helpers/auth');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// ------------------------------->>> Acao
// Inicia a sessao no servidor, permite acesso as rotas protegidas
const logon = async (req, res) => {
	const sess = req.session;
	const sessWrapper = __serverConfig.auth.sessWrapper;

	if (Object.prototype.hasOwnProperty.call(sess, sessWrapper)) {
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
								,A.ATIVO USUARIO_ATIVO
								,B.ID_EMPRESA empresaId
								,B.EMPRESA empresaNome
								,B.PROPRIETARIO empresaProprietario
								,B.ATIVO EMPRESA_ATIVA
								,B.DATA_LIMITE_USO
							FROM
								nodetest.USUARIO A (NOLOCK)
								INNER JOIN nodetest.EMPRESA B (NOLOCK)
									ON (A.ID_EMPRESA = B.ID_EMPRESA)
							WHERE
								A.EMAIL = @login
								AND A.DELETADO is NULL;

							SELECT
								C.PERFIL _perfis
							FROM
								nodetest.USUARIO A (NOLOCK)
								INNER JOIN nodetest.PERFIL_USUARIO B (NOLOCK)
									ON (A.ID_USUARIO = B.ID_USUARIO)
								INNER JOIN nodetest.PERFIL C (NOLOCK)
									ON (B.ID_PERFIL = C.ID_PERFIL)
							WHERE
								A.EMAIL = @login
								AND A.DELETADO is NULL;

							SELECT DISTINCT
								D.FUNCAO _funcoes
							FROM
								nodetest.USUARIO A (NOLOCK)
								INNER JOIN nodetest.PERFIL_USUARIO B (NOLOCK)
									ON (A.ID_USUARIO = B.ID_USUARIO)
								INNER JOIN nodetest.PERFIL_FUNCAO C (NOLOCK)
									ON (B.ID_PERFIL = C.ID_PERFIL)
								INNER JOIN nodetest.FUNCAO D (NOLOCK)
									ON (C.ID_FUNCAO = D.ID_FUNCAO)
							WHERE
								A.EMAIL = @login
								AND A.DELETADO is NULL;
							-- ----------------------------------------
						`
					}
				};

				const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
				const dataUser = resultSet && resultSet.rowsAffected[0] === 1 && resultSet.recordsets[0].pop();
				const senhaCheck = (dataUser ? cryptoHash.hash(senha, dataUser.SALT) : null);

				if (senhaCheck && (senhaCheck.passHash === dataUser.SENHA)) {
					if (dataUser.EMPRESA_ATIVA) {
						if (dataUser.USUARIO_ATIVO) {
							if (dataUser.DATA_LIMITE_USO === null || functions.checkDateAfterNow(dataUser.DATA_LIMITE_USO)) {
								// Limpa eventuais sessoes anteriores ativas para este usuario
								await helpersAuth.checkForLoggedSessions(req, dataUser.id);

								const perfis = (
									resultSet && resultSet.rowsAffected[1] !== 0 && resultSet.recordsets[1].map(
										_p => {
											return _p._perfis;
										}
									)
								) || [];

								const funcoes = (
									resultSet && resultSet.rowsAffected[2] !== 0 && resultSet.recordsets[2].map(
										_f => {
											return _f._funcoes;
										}
									)
								) || [];

								/* Session data */
								sess[sessWrapper] = {
									id: dataUser.id,
									nome: dataUser.nome,
									email: dataUser.email,
									empresa: [
										dataUser.empresaId,
										dataUser.empresaNome,
										dataUser.empresaProprietario
									],
									perfis: perfis,
									funcoes: funcoes
								};
								/* Session data */
							} else {
								errWrapper.throwThis('AUTH', 400, 'Empresa atingiu a data limite de uso do sistema...');
							}
						} else {
							errWrapper.throwThis('AUTH', 400, 'Usuário inativo...');
						}
					} else {
						errWrapper.throwThis('AUTH', 400, 'Empresa inativa...');
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

	return sess[sessWrapper];
};

// ------------------------------->>> Acao
// Finaliza a sessao no servidor, rotas protegidas ficam inascessiveis
const logoff = (req, res) => {
	return new Promise((resolve, reject) => {
		const sess = req.session;
		const sessWrapper = __serverConfig.auth.sessWrapper;

		const sessionExists = Object.prototype.hasOwnProperty.call(sess, sessWrapper);

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

// ------------------------------->>> Acao
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
