'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const user = require('@serverRoot/actions/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = async (req, res) => {
	try {
		res.locals.routeControllerRoute = 'USER';
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const userRoutes = router => {
	// Colecao usuarios ----------------------------------------------------
	router.route('/usuario')
	.all(async (req, res, next) => {
		try {
			await _commonGate(req, res);
			next();
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await user.consultarTodos(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// Model usuario -------------------------------------------------------
	router.route('/usuario/:id')
	.all(async (req, res, next) => {
		try {
			await _commonGate(req, res);
			next();
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await user.consultar(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await user.inserir(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	})
	.put(async (req, res) => {
		try {
			let result = await user.alterar(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	})
	.delete(async (req, res) => {
		try {
			let result = await user.excluir(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	});
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	userRoutes
};
