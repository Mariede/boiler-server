'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const functions = require('@serverRoot/helpers/functions');
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
	.all (
		functions.handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.post (
		functions.handleErrorsController (
			async (req, res, next) => {
				let result = await auth.logon(req, res);
				res.status(200).send(result);
			}
		)
	);
	// ---------------------------------------------------------------------

	// Rota: logout --------------------------------------------------------
	router.route('/logout')
	.all (
		functions.handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				let result = await auth.logout(req, res);
				res.status(200).send(result);
			}
		)
	);
	// ---------------------------------------------------------------------

	// Rota: isLogged ------------------------------------------------------
	router.route('/isLogged')
	.all (
		functions.handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.get (
		functions.handleErrorsController (
			async (req, res, next) => {
				let result = await auth.isLogged(req, res);
				res.status(200).send(result);
			}
		)
	);
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	authRoutes
};
