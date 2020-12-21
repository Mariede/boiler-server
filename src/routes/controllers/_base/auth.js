'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// Acoes
const auth = require('@serverRoot/actions/_base/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = (req, res) => {
	res.locals.routeControllerRoute = 'AUTH';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const authRoutes = (router, handleErrorsController) => {
	// Rota: logon -------------------------------------------------------------
	router
	.route('/logon')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.post(
		handleErrorsController(
			async (req, res) => {
				const result = await auth.logon(req, res);
				res.status(200).send(result);
			}
		)
	);
	// -------------------------------------------------------------------------

	// Rota: logoff ------------------------------------------------------------
	router
	.route('/logoff')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.post(
		handleErrorsController(
			async (req, res) => {
				const result = await auth.logoff(req, res);
				res.status(200).send(result);
			}
		)
	);
	// -------------------------------------------------------------------------

	// Rota: islogged ----------------------------------------------------------
	router
	.route('/islogged')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.get(
		handleErrorsController(
			async (req, res) => {
				const result = await auth.isLogged(req, res);
				res.status(200).send(result);
			}
		)
	);
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	authRoutes
};
