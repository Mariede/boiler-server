'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Dispara um erro customizado na pilha de erros (Novo objeto err)
const throwThis = (name, code, message) => {
	const e = new Error();

	e.name = name;
	e.code = code;
	e.message = message;

	throw e;
};

// Retorna um erro customizado na pilha de erros (Objeto err existente)
const returnThis = (name, code, err, formmated = true) => {
	let result = err;

	if (formmated) {
		const e = new Error();

		e.name = name;
		e.code = code;
		e.message = result.message;

		result = e;
	} else {
		result.name = name;
		result.code = code;
	}

	return result;
};
// -------------------------------------------------------------------------

module.exports = {
	throwThis,
	returnThis
};
