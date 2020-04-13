'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

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
const authRoutes = (router, handleErrorsController) => {
	// Rota: logon ---------------------------------------------------------
	router.route('/logon')
	.all (
		handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.post (
		handleErrorsController (
			async (req, res) => {
				let result = await auth.logon(req, res);
				res.status(200).send(result);
			}
		)
	);
	// ---------------------------------------------------------------------

	// Rota: logout --------------------------------------------------------
	router.route('/logout')
	.all (
		handleErrorsController (
			async (req, res) => {
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
		handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.get (
		handleErrorsController (
			async (req, res) => {
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
