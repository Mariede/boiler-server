'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const usuario = require('@serverRoot/actions/usuario');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _gateLocal = async (req, res) => {
	try {
		res.locals.routeControllerRoute = 'USUARIO';
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasUsuario = router => {
	// Colecao usuarios ----------------------------------------------------
	router.route('/usuario')
	.all(async (req, res, next) => {
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await usuario.consultarTodos(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// Model usuario -------------------------------------------------------
	router.route('/usuario/:id')
	.all(async (req, res, next) => {
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await usuario.consultar(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await usuario.inserir(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.put(async (req, res) => {
		try {
			let result = await usuario.alterar(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.delete(async (req, res) => {
		try {
			let result = await usuario.excluir(req, res);
			res.status(200).send(result);
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
