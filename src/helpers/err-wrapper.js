'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

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
const returnThis = (name, code, err, formatted = true) => {
	if (formatted) {
		const e = new Error();

		e.name = name;
		e.code = code;
		e.message = err.message;

		return e;
	}

	err.name = name;
	err.code = code;

	return err;
};
// -------------------------------------------------------------------------

module.exports = {
	throwThis,
	returnThis
};
