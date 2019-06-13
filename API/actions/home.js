'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		const formatZeroLeft = num => {
			return ('0' + num).slice(-2);
		};

		let agora = new Date(),
			agoraFormatado = `${formatZeroLeft(agora.getDate())}/${formatZeroLeft(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatZeroLeft(agora.getHours())}:${formatZeroLeft(agora.getMinutes())}:${formatZeroLeft(agora.getSeconds())} h`,
			fRet = { file: 'index.ejs', path: '_home/', data: `Hora do servidor : ${agoraFormatado}` };

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
