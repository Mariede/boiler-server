'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const mongoose = require('mongoose');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Esquemas mongoose para MongoDB
	-> verifique exemplos na pasta de documentacao
*/
const schemas = {
	users: {
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		age: {
			type: Number,
			required: true
		},
		pass: {
			type: String,
			required: true
		},
		salt: {
			type: String,
			required: true
		},
		active: {
			type: Boolean,
			required: true
		},
		type: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'types',
			required: true
		}
	},
	types: {
		type: {
			type: String,
			required: true,
			unique: true,
			trim: true
		}
	}
};

/*
Indices compostos associados na criacao dos esquemas
	-> ex: { key1: 1, key2: -1, _unique: true } ou [{ key1: 1, key2: -1 }, { ke5: 1, key6: 1, _unique: true }]
		 1: Ascendente
		-1: Descendente

	-> Acrescentar a chave _unique: true ao objeto de indice para indice unico
*/
const schemasCompoundIndexes = {
	users: [{ name: 1, age: -1, _unique: true }, { name: 1, type: -1 }]
};

/*
Opcoes extras associadas na criacao dos esquemas e acopladas as opcoes gerais (em config)
	-> ex: { bufferCommands: true }
*/
const schemasExtraOptions = {};

module.exports = {
	schemas,
	schemasCompoundIndexes,
	schemasExtraOptions
};
