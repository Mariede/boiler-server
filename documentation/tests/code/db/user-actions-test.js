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

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	resultSet.recordset = paginator.setSort(req, resultSet.recordset, true); // Ordenador
	const pagedResultSet = paginator.setPage(req, resultSet, resultSet.recordset, resultSet.rowsAffected); // Paginador

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

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
	resultSet.recordset = paginator.keysToCamelCase(resultSet.recordset); // Chaves para camelCase

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

const excluir = (req, res) => {
	const fRet = 'exclui usuario';
	const id = req.params.id;

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
