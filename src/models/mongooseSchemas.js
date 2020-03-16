'use strict';

const mongoose = require('mongoose');

// esquemas
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
indices compostos associados a criacao dos esquemas
	-> ex: [{ key1: 1, key2: -1 }, { ke5: 1, key6: 1, _unique: true }]
		 1: Ascendente
		-1: Descendente

	-> Acrescentar a chave _unique: true ao objeto de indice para indice unico
*/
const schemasCompoundIndexes = {
	users: [{ name: 1, age: -1, _unique: true }, { name: 1, type: -1 }]
};

// opcoes extras associadas a criacao dos esquema e acopladas as opcoes gerais (em config)
const schemasExtraOptions = {};

module.exports = {
	schemas,
	schemasCompoundIndexes,
	schemasExtraOptions
};
