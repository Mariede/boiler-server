'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		let ioUrl = __serverConfig.socketIo.clientUrl + home.rootIoNameSpace,
			fRet = { file: 'index.ejs', path: '_home/', data: home.rootFormatDateNow(), ioUrl: ioUrl };
		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
