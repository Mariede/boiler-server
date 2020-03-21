'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Define o namespace do listener em root (home)
const rootIoNameSpace = '/home.io';

// Verifica a data atual do servidor (formatado)
const rootFormatDateNow = () => {
	const formatLeftZeros = num => {
		return ('0' + num).slice(-2);
	};

	const agora = new Date();

	return `${formatLeftZeros(agora.getDate())}/${formatLeftZeros(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatLeftZeros(agora.getHours())}:${formatLeftZeros(agora.getMinutes())}:${formatLeftZeros(agora.getSeconds())}`;
};
// -------------------------------------------------------------------------

module.exports = {
	rootIoNameSpace,
	rootFormatDateNow
};
