'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		let fRet = { file: 'index.ejs', path: '_home/', pageData: { date: home.rootFormatDateNow(), ioUrl: home.rootIoNameSpace, logoWidth: 574 }};
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
