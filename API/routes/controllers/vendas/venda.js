"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// Acoes

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware para rotas aqui
const gateLocal = async (req, res) => {
	try {
		return;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasVenda = (router) => {
	router.route('/venda')
	// Colecao vendas ------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			res.status(200).send('GET Request ALL');
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/venda/:id')
	// Model venda ---------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			res.status(200).send('GET Request');
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			res.status(200).send('POST Request');
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.put(async (req, res) => {
		try {
			res.status(200).send('PUT Request');
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.delete(async (req, res) => {
		try {
			res.status(200).send('DELETE Request');
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	rotasVenda
};
