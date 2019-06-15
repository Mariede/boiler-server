'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const root = async (req, res) => {
	try {
		const formatZeroLeft = num => {
			return ('0' + num).slice(-2);
		};

		let agora = new Date(),
			agoraFormatado = `${formatZeroLeft(agora.getDate())}/${formatZeroLeft(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatZeroLeft(agora.getHours())}:${formatZeroLeft(agora.getMinutes())}:${formatZeroLeft(agora.getSeconds())}`,
			fRet = { file: 'index.ejs', path: '_home/', data: agoraFormatado };

		return fRet;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	root
};
