'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const auth = require('@serverRoot/actions/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware para rotas aqui
const _gateLocal = async (req, res) => {
	try {
		log.logger('info', '=> em Controller AUTH', 'consoleOnly');
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasAuth = router => {
	router.route('/login')
	// login ---------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await auth.login(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/logout')
	// logout --------------------------------------------------------------
	.all(async (req, res) => {
	// Todos os verbos
		try {
			await _gateLocal(req, res);

			let result = await auth.logout(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/isLogged')
	// isLogged ------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await auth.isLogged(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	rotasAuth
};
