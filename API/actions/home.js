'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		let fRet = { file: 'index.html', path: __serverRoot + '/views/_home' };
		return fRet;
	} catch(err) {
		throw err;
	}
};

const login = async (req, res) => {
	try {
		let fRet = await auth.login(req);
		return fRet;
	} catch(err) {
		throw err;
	}
};

const logout = async (req, res) => {
	try {
		let fRet = await auth.logout(req, res);
		return fRet;
	} catch(err) {
		throw err;
	}
};

const isLogged = async (req, res) => {
	try {
		let fRet = await auth.isLogged(req, 2);
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root,
	login,
	logout,
	isLogged
};
