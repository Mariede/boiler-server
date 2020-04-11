'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const home = require('@serverRoot/actions/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = async (req, res) => {
	res.locals.routeControllerRoute = 'HOME';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const homeRoutes = router => {
	// Rota: root ----------------------------------------------------------
	router.route('/')
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
			async (req, res) => {
				let result = await home.root(req, res);
				res.status(200).render(result.path + result.file, result.pageData);
			}
		)
	);
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	homeRoutes
};
