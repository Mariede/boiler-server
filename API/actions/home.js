"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			// let fRet = '<html><body><h3>Bem vindo, servidor em NODE.js</h3></body></html>';
			let fRet = 'index.html';
			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};

const login = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = auth.login(req);
			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};

const logout = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = auth.logout(req, res);
			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};

const isLogged = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = auth.isLogged(req, 2);
			resolve(fRet);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	root,
	login,
	logout,
	isLogged
};
