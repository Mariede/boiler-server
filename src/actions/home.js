'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const socketIoListeners = require('@serverRoot/libCom/socketIoListeners');
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = (req, res) => {
	const fRet = { file: 'index.ejs', path: '_home/', pageData: { date: functions.getDateNow(true), ioUrl: socketIoListeners.nameSpaces.ioRootNameSpace, ioPath: __serverConfig.socketIo.path } };

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
