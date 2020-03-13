'use strict';

const mongoose = require('mongoose');

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

const schemasCompoundIndexes = {
	users: [{ name: 1, age: -1, _unique: true }, { name: 1, type: -1 }]
};

module.exports = {
	schemas,
	schemasCompoundIndexes
};
