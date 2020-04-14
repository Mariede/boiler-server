'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
const paginator = require('@serverRoot/helpers/paginator');
const validator = require('@serverRoot/helpers/validator');
const errWrapper = require('@serverRoot/helpers/errWrapper');
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
					,A.ID_TIPO
					,A.NOME
					,A.EMAIL
					,A.SENHA
					,A.SALT
					,A.ATIVO
					,B.TIPO
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO);
			`
		}
	};

	let { recordsets: recordSets, ...resultSet } = await dbCon.msSqlServer.sqlExecuteAll(query);

	resultSet.recordset = await paginator.setSort(req, resultSet.recordset, true); // Ordenador
	resultSet = await paginator.setPage(req, resultSet, resultSet.rowsAffected[0]); // Paginador

	return resultSet;
};

const consultar = async (req, res) => {
	const idUsuario = req.params.id;

	let checkedResultSet = {};

	if (validator.isInteger(idUsuario, false)) {
		const query = {
			formato: 1,
			dados: {
				input: [
					['idUsuario', 'int', idUsuario]
				],
				executar: `
					SELECT
						A.ID_USUARIO
						,A.ID_TIPO
						,A.NOME
						,A.EMAIL
						,A.SENHA
						,A.SALT
						,A.ATIVO
						,B.TIPO
					FROM
						USUARIO A (NOLOCK)
						INNER JOIN TIPO B (NOLOCK)
							ON (A.ID_TIPO = B.ID_TIPO)
					WHERE
						A.ID_USUARIO = @idUsuario;
				`
			}
		};

		let { recordsets: recordSets, ...resultSet } = await dbCon.msSqlServer.sqlExecuteAll(query);

		resultSet.recordset = await paginator.keysToCamelCase(resultSet.recordset); // Chaves para camelCase

		checkedResultSet = resultSet;
	} else {
		errWrapper.throwThis('AUTH', 400, 'ID do usuário deve ser numérico...');
	}

	return checkedResultSet;
};

const inserir = (req, res) => {
	let fRet = 'insere usuario',
		id = req.params.id;

	return `${fRet} ${id}`;
};

const alterar = (req, res) => {
	let fRet = 'altera usuario',
		id = req.params.id;

	return `${fRet} ${id}`;
};

const excluir = (req, res) => {
	let fRet = 'exclui usuario',
		id = req.params.id;

	return `${fRet} ${id}`;
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir
};
