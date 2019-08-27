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
// Middleware
const _gateLocal = async (req, res) => {
	try {
		res.locals.routeControllerRoute = 'AUTH';
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasAuth = router => {
	// logon ---------------------------------------------------------------
	router.route('/logon')
	.all(async (req, res, next) => {
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await auth.logon(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// logout --------------------------------------------------------------
	router.route('/logout')
	.all(async (req, res) => {
		try {
			await _gateLocal(req, res);

			let result = await auth.logout(req, res);
			res.status(200).send(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// isLogged ------------------------------------------------------------
	router.route('/isLogged')
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
