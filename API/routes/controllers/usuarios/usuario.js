'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const usuario = require('@serverRoot/actions/usuario/usuario');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware para rotas aqui
const gateLocal = async (req, res) => {
	try {
		log.logger('info', '=> em Controller USUARIO', 'consoleOnly');
		return;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasUsuario = (router) => {
	router.route('/usuario')
	// Colecao usuarios ----------------------------------------------------
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
			let result = await usuario.consultarTodos(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/usuario/:id')
	// Model usuario -------------------------------------------------------
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
			let result = await usuario.consultar(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await usuario.inserir(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.put(async (req, res) => {
		try {
			let result = await usuario.alterar(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.delete(async (req, res) => {
		try {
			let result = await usuario.excluir(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	rotasUsuario
};
