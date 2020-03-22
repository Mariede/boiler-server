'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const socketIoListeners = require('@serverRoot/listeners/socketIoListeners');
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		let fRet = { file: 'index.ejs', path: '_home/', pageData: { date: functions.getDateNow(true), ioUrl: socketIoListeners.nameSpaces.ioRootNameSpace, ioPath: __serverConfig.socketIo.path, logoWidth: 574 }};
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
