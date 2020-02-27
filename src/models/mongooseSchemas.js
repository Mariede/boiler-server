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
			required: false
		}
	},
	types: {
		type: String,
		required: true,
		trim: true
	}
};

module.exports = {
	schemas
};
