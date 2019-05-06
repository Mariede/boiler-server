"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
	try {
		let query1 = {
				formato: 1,
				dados: {
					executar: 'SELECT SORTER2, SORTER1, ID_USUARIO, NOME, SENHA, ATIVO FROM USUARIO (NOLOCK)'
				}
			};

		const paginator = require('@serverRoot/helpers/paginator');
		let result1 = await dbCon.sqlExecuteAll(query1);
		await paginator.setSorter(result1.recordsets[0], ['SORTER2', 'SORTER1'], 'DESC'); // sorter atua no proprio conjunto de dados, referenciado. 'ASC' pode ser omitido (default)
		let pResult = await paginator.setPage(result1.recordsets[0], result1.rowsAffected[0], 3, 9); // paginado: pagina 3 / 9 itens por pagina

		return pResult;
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
