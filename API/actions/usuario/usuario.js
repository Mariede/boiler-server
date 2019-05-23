'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
const paginator = require('@serverRoot/helpers/paginator');
const searcher = require('@serverRoot/helpers/searcher');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
	try {
		let query = {
				formato: 1,
				dados: {
					input: [
						['NOME', 'varchar(200)', '%joa%']
					],
					executar: 'SELECT SORTER2, SORTER1, ID_USUARIO, NOME, SENHA, ATIVO FROM USUARIO (NOLOCK) WHERE NOME LIKE(@NOME)'
				}
			};

		// // Searcher: searchFields deve ser uma array (nomes ambiguos no search geram erro)
		// let resultSet = await searcher.setSearch(
		// 		req,
		// 		baseQuery,
		// 		replaceQuery
		// 	);

		// Executa query ou queries
		let resultSet = await dbCon.sqlExecuteAll(query);
		// Camel Case: renomeia chaves no objeto JSON para o padrao Camel Case
		resultSet.recordsets[0] = await paginator.keysToCamelCase(resultSet.recordsets[0]);
		// Ordenador (sort)
		resultSet.recordsets[0] = await paginator.setSort(req, resultSet.recordsets[0]);
		// Paginador (page)
		resultSet.recordsets[0] = await paginator.setPage(req, resultSet.recordsets[0], resultSet.rowsAffected[0]);

		return resultSet;
	} catch(err) {
		throw new Error(err);
	}
};

const consultar = async (req, res) => {
	try {
		let fRet = 'consulta usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const inserir = async (req, res) => {
	try {
		let fRet = 'insere usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const alterar = async (req, res) => {
	try {
		let fRet = 'altera usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const excluir = async (req, res) => {
	try {
		let fRet = 'exclui usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
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
