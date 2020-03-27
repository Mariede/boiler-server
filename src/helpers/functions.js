'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica a data atual do servidor (formatado)
const getDateNow = formatted => {
	try {
		const formatLeftZeros = num => {
			return ('0' + num).slice(-2);
		};

		let agora = new Date();

		if (formatted) {
			agora = `${formatLeftZeros(agora.getDate())}/${formatLeftZeros(agora.getMonth() + 1)}/${agora.getFullYear()} ${formatLeftZeros(agora.getHours())}:${formatLeftZeros(agora.getMinutes())}:${formatLeftZeros(agora.getSeconds())}`;
		}

		return agora;
	} catch (err) {
		throw err;
	}
};

// Loop forEach assincrono
const asyncForEach = async (array, callback) => {
	try {
		for (let i = 0; i < array.length; i++) {
			let endThisLoopNow = await callback(array[i], i, array);

			if (endThisLoopNow) {
				break;
			}
		}
	} catch (err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	getDateNow,
	asyncForEach
};
