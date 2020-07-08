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
const root = (req, res) => {
	const fRet = { file: 'index.html', path: '/views/client-side/public' };
	return fRet;
};

const server = (req, res) => {
	const fRet = { file: 'index.ejs', path: '_home/', pageData: { date: functions.getDateNow(true), ioUrl: socketIoListeners.nameSpaces.ioRootNameSpace, ioPath: __serverConfig.socketIo.path } };
	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	root,
	server
};
