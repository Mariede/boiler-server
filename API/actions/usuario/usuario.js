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
		let query1 = {
				formato: 1,
				dados: {
					input: [
						['NOME', 'varchar(200)', '%joa%']
					],
					executar: 'SELECT SORTER2, SORTER1, ID_USUARIO, NOME, SENHA, ATIVO FROM USUARIO (NOLOCK) WHERE NOME LIKE(@NOME)'
				}
			};

		// // Searcher: searchFields deve ser uma array (nomes ambiguos no search geram erro)
		// let result1 = await searcher.setSearch(
		// 		req,
		// 		`
		// 		select top 10
		// 			*
		// 		from
		// 			usuario a (nolock)
		// 			inner join tipo b (nolock)
		// 				on (a.id_tipo = b.id_tipo)
		// 		where
		// 			a.nome like('%joa%')
		// 			{{REPLACE}}
		// 		`,
		// 		'{{REPLACE}}'
		// 	);

		// Executa query ou queries
		let result1 = await dbCon.sqlExecuteAll(query1);
		// Camel Case: renomeia chaves no objeto JSON para o padrao Camel Case
		result1.recordsets[0] = await paginator.keysToCamelCase(result1.recordsets[0]);
		// Ordenador (sort)
		result1.recordsets[0] = await paginator.setSort(req, result1.recordsets[0]);
		// Paginador (page)
		result1.recordsets[0] = await paginator.setPage(req, result1.recordsets[0], result1.rowsAffected[0]);

		return result1;
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
