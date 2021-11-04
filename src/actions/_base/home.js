'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
const socketIoListeners = require('@serverRoot/lib-com/socket-io-listeners');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// ------------------------------->>> Acao
// Pagina Easter Egg
const egg = (req, res) => {
	const fRet = {
		file: 'index.html',
		path: '/views/server-side/pages/_egg/'
	};

	return fRet;
};

// ------------------------------->>> Acao
// Pagina informativa do servidor
const server = (req, res) => {
	const fRet = {
		file: 'index.ejs',
		path: '_home/',
		pageData: {
			date: functions.getDateNow(true),
			ioUrl: socketIoListeners.nameSpaces.ioRootNameSpace,
			ioPath: __serverConfig.socketIo.path,
			server: {
				name: process.env.npm_package_name,
				version: process.env.npm_package_version,
				uptime: process.uptime()
			}
		}
	};

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	egg,
	server
};
