'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Define o namespace do listener em root (home)
const rootIoNameSpace = '/home.io';

// Verifica a data atual do servidor (formatado)
const rootFormatDateNow = () => {
	const formatZeroLeft = num => {
		return ('0' + num).slice(-2);
	};

	const agora = new Date();

	return `${formatZeroLeft(agora.getDate())}/${formatZeroLeft(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatZeroLeft(agora.getHours())}:${formatZeroLeft(agora.getMinutes())}:${formatZeroLeft(agora.getSeconds())}`;
};
// -------------------------------------------------------------------------

module.exports = {
	rootIoNameSpace,
	rootFormatDateNow
};
