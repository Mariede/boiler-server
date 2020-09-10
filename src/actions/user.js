'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const paginator = require('@serverRoot/helpers/paginator');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
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
					,A.ID_TIPO [TIPO.ID]
					,B.TIPO [TIPO.NOME]
					,(
						SELECT
							D.ID_PERFIL [PERFIL.ID]
							,D.PERFIL [PERFIL.NOME]
						FROM
							PERFIL_USUARIO C (NOLOCK)
							INNER JOIN PERFIL D (NOLOCK)
								ON C.ID_PERFIL = D.ID_PERFIL
						WHERE
							A.ID_USUARIO = C.ID_USUARIO
						FOR XML PATH ('PERFIL'), ROOT('PERFIS')
					) [PERFIS]
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO);
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Ordenador
	resultSet.recordset = paginator.setSort(req, resultSet.recordset, [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	// Paginador
	const pagedResultSet = paginator.setPage(req, resultSet, resultSet.recordset, resultSet.rowsAffected);

	return pagedResultSet;
};

const consultar = async (req, res) => {
	// Parametros de entrada
	const idUsuario = req.params.id;

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('AUTH', 400, 'ID do usuário deve ser numérico...');
	}

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario]
			],
			executar: `
				SELECT
					A.ID_USUARIO
					,A.NOME
					,A.EMAIL
					,A.SENHA
					,A.SALT
					,A.ATIVO
					,A.ID_TIPO [TIPO.ID]
					,B.TIPO [TIPO.NOME]
					,(
						SELECT
							D.ID_PERFIL [PERFIL.ID]
							,D.PERFIL [PERFIL.NOME]
						FROM
							PERFIL_USUARIO C (NOLOCK)
							INNER JOIN PERFIL D (NOLOCK)
								ON C.ID_PERFIL = D.ID_PERFIL
						WHERE
							A.ID_USUARIO = C.ID_USUARIO
						FOR XML PATH ('PERFIL'), ROOT('PERFIS')
					) [PERFIS]
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO)
				WHERE
					A.ID_USUARIO = @idUsuario;
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Chaves para camelCase
	resultSet.recordset = paginator.keysToCamelCase(resultSet.recordset, [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	return resultSet;
};

const inserir = (req, res) => {
	const fRet = 'insere usuario';
	const id = req.params.id;

	return `${fRet} ${id}`;
};

const alterar = (req, res) => {
	const fRet = 'altera usuario';
	const id = req.params.id;

	return `${fRet} ${id}`;
};

const excluir = async (req, res) => {
	// Parametros de entrada
	const idUsuario = req.params.id;

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('AUTH', 400, 'ID do usuário deve ser numérico...');
	}

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario]
			],
			executar: `
				DELETE
				FROM
					PERFIL_USUARIO
				WHERE
					ID_USUARIO = @idUsuario;

				DELETE
				FROM
					USUARIO
				WHERE
					ID_USUARIO = @idUsuario;
			`
		}
	};

	await dbCon.msSqlServer.sqlExecuteAll(query);

	return idUsuario;
};

const ativacao = async (req, res) => {
	// Parametros de entrada
	const idUsuario = req.params.id;
	const ativo = req.body.ativo === true;

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('AUTH', 400, 'ID do usuário deve ser numérico...');
	}

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['ativo', 'bit', !ativo]
			],
			executar: `
				UPDATE
					A
				SET
					A.ATIVO = @ativo
				FROM
					USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;
			`
		}
	};

	await dbCon.msSqlServer.sqlExecuteAll(query);

	return idUsuario;
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir,
	ativacao
};
