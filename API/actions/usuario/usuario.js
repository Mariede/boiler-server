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



// const uploader = require('@serverRoot/helpers/uploader');
// let result = {};

// // se memoryStorage selecionado, utilizar buffer.toString('utf8') para converter valor da memoria
// result = await uploader.push(req, res, [{ name: 'arquivoDeSubida' }, { name: 'arquivoDeSubida1' }], 'extra\\zzz/next/|u&;$%@"<>()+,o-i');
// return result;


// **** testes email
const email = require('@serverRoot/helpers/email');
return await email.sendEmail(
		['testefrom@hotmail.com', 'From'],
		[
			['testeto1@gmail.com', 'To 1'],
			['testeto2@gmail.com'],
			['testeto3@gmail.com'],
			['testeto4@gmail.com'],
			['testeto5@gmail.com'],
			['testeto6@gmail.com'],
			['testeto7@gmail.com'],
			['testeto8@gmail.com']
		],
		[
			['testecc1@hotmail.com', 'Cc 1'],
			['testecc2@gmail.com', 'Cc 2'],
			['testecc3@hotmail.com', 'Cc 3']
		],
		[
			['testebcc1@hotmail.com', 'Bcc 1'],
			['testebcc2@hotmail.com', 'Bcc 2'],
			['testebcc3@hotmail.com', 'Bcc 3'],
			['testebcc4@gmail.com', 'Bcc 4'],
			['testebcc5@outlook.com', 'Bcc 5'],
			['testebcc6@outlook.com']
		],
		'teste de envio - subject',
		`<br>teste<br><br>de envio - <a href="dddd">body</a> aqui jaz!!
		<p>ahuhauahuahua</p> gggg`,
		[],
		{ to: 3, cc: 15, bcc: 1}
	);
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
