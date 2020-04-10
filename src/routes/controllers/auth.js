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
const _commonGate = async (req, res) => {
	res.locals.routeControllerRoute = 'AUTH';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const authRoutes = router => {
	// Rota: logon ---------------------------------------------------------
	router.route('/logon')
	.all(async (req, res, next) => {
		try {
			await _commonGate(req, res);
			next();
		} catch (err) {
			log.controllerError(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await auth.logon(req, res);
			res.status(200).send(result);
		} catch (err) {
			log.controllerError(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// Rota: logout --------------------------------------------------------
	router.route('/logout')
	.all(async (req, res, next) => {
		try {
			await _commonGate(req, res);

			let result = await auth.logout(req, res);
			res.status(200).send(result);
		} catch (err) {
			log.controllerError(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	// Rota: isLogged ------------------------------------------------------
	router.route('/isLogged')
	.all(async (req, res, next) => {
		try {
			await _commonGate(req, res);
			next();
		} catch (err) {
			log.controllerError(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await auth.isLogged(req, res);
			res.status(200).send(result);
		} catch (err) {
			log.controllerError(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	authRoutes
};
