'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica a data atual do servidor (formatado)
const getDateNow = formatted => {
	const formatLeftZeros = num => {
		return ('0' + num).slice(-2);
	};

	let agora = new Date();

	if (formatted) {
		agora = `${formatLeftZeros(agora.getDate())}/${formatLeftZeros(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatLeftZeros(agora.getHours())}:${formatLeftZeros(agora.getMinutes())}:${formatLeftZeros(agora.getSeconds())}`;
	}

	return agora;
};
// -------------------------------------------------------------------------

module.exports = {
	getDateNow
};
