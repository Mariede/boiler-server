'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
	try {
		let fRet = 'consulta todos usuarios';
		return fRet;
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


const uploader = require('@serverRoot/helpers/uploader');
let result = {};

// Sempre array para passa nome do campo
// true para diskStorage | false para memoryStorage (default: true)
// se memoryStorage selecionado, utilizar buffer.toString('utf8') para converter valor da memoria
result = await uploader.execute(req, res, [{ name: 'arquivoDeSubida' }, { name: 'arquivoDeSubida1' }], true);
return result;


// **** testes email

// const email = require('@serverRoot/helpers/email');
// let info = await email.sendEmail(
// 		'miriede@hotmail.com',
// 		'miriede@gmail.com',
// 		'teste de envio - subject',
// 		'teste de envio - body',
// 		'[{ }]'
// 	);
// console.log(info);
// **** testes email





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
