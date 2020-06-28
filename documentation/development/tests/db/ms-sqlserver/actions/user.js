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
const consultarTodos = (req, res) => {
	const fRet = 'consulta todos os usuarios';

	return `${fRet}`;
};

const consultar = (req, res) => {
	const fRet = 'consulta usuario';
	const id = req.params.id;

	return `${fRet} ${id}`;
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
