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
	try {
		let resultSet;

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

		resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
		resultSet.recordsets[0] = await paginator.setSort(req, resultSet.recordsets[0], true); // ordenador
		resultSet.recordsets[0] = await paginator.setPage(req, resultSet.recordsets[0], resultSet.rowsAffected[0]); // paginador

		return resultSet.recordsets[0];
	} catch(err) {
		throw err;
	}
};

const consultar = async (req, res) => {
	try {
		let resultSet;

		const id = req.params.id;

		if (validator.isInteger(id, false)) {
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
								ON (A.ID_TIPO = B.ID_TIPO)
						WHERE
							A.ID_USUARIO = ${id};
					`
				}
			};

			resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
		} else {
			errWrapper.throwThis('AUTH', 400, 'ID do usuário deve ser numérico...');
		}

		return resultSet.recordsets[0];
	} catch(err) {
		throw err;
	}
};

const inserir = async (req, res) => {
	try {
		let fRet = 'insere usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw err;
	}
};

const alterar = async (req, res) => {
	try {
		let fRet = 'altera usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw err;
	}
};

const excluir = async (req, res) => {
	try {
		let fRet = 'exclui usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir
};
