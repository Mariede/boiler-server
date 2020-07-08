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
const egg = (req, res) => {
	const fRet = { file: 'index.html', path: '/views/server-side/pages/_egg/' };
	return fRet;
};

const server = (req, res) => {
	const fRet = { file: 'index.ejs', path: '_home/', pageData: { date: functions.getDateNow(true), ioUrl: socketIoListeners.nameSpaces.ioRootNameSpace, ioPath: __serverConfig.socketIo.path } };
	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	egg,
	server
};
