'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Dispara um erro customizado na pilha de erros
const throwThis = (name, code, message) => {
	const e = new Error();

	e.name = name;
	e.code = code;
	e.message = message;

	throw e;
};
// -------------------------------------------------------------------------

module.exports = {
	throwThis
};
