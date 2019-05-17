'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
const paginator = require('@serverRoot/helpers/paginator');
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


// const searcher = require('@serverRoot/helpers/searcher');
// return searcher.searchExecute('select top 10 * from usuario (nolock) {{REPLACE}}', ['SORTER2', 'SORTER1', 'NOME'], '56');


		// Executa query
		let result1 = await dbCon.sqlExecuteAll(query1);
		// Sorter, sorterElements deve ser uma array e case sensitive, sortOrder Array opcional ASC/DESC (default: ASC)
		result1.recordsets[0] = await paginator.setSorter(result1.recordsets[0], ['SORTER2', 'SORTER1'], ['DESC', 'ASC']);
		// Renomeia chaves no objeto JSON para o padrao CamelCase
		result1.recordsets[0] = await paginator.keysToCamelCase(result1.recordsets[0]);
		// Paginacao: pagina 3 / 9 itens por pagina, retorno => pageDetails, itemsList, rowsAffected
		result1.recordsets[0] = await paginator.setPage(result1.recordsets[0], result1.rowsAffected[0], 3, 9);

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
