'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		let fRet = { file: 'index.ejs', path: '_home/', data: home.rootFormatDateNow(), ioUrl: home.rootIoNameSpace };
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
