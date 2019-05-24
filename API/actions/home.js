'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		// let fRet = '<html><body><h3>Bem vindo, servidor em NODE.js</h3></body></html>';
		let fRet = 'index.html';
		return fRet;
	} catch(err) {
		throw new Error(err);
	}
};

const login = async (req, res) => {
	try {
		let fRet = await auth.login(req);
		return fRet;
	} catch(err) {
		throw new Error(err);
	}
};

const logout = async (req, res) => {
	try {
		let fRet = await auth.logout(req, res);
		return fRet;
	} catch(err) {
		throw new Error(err);
	}
};

const isLogged = async (req, res) => {
	try {
		let fRet = await auth.isLogged(req, 2);
		return fRet;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root,
	login,
	logout,
	isLogged
};
