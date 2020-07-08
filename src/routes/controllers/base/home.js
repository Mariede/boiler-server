'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const home = require('@serverRoot/actions/base/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = (req, res) => {
	res.locals.routeControllerRoute = 'HOME';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const homeRoutes = (router, handleErrorsController) => {
	// Rota: root ----------------------------------------------------------
	router.route('/')
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
				const result = await home.root(req, res);
				res.status(200).sendFile(
					result.file,
					{
						root: __serverRoot + result.path
					}
				);
			}
		)
	);
	// ---------------------------------------------------------------------

	// Rota: server --------------------------------------------------------
	router.route('/server')
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
				const result = await home.server(req, res);
				res.status(200).render(
					result.path + result.file,
					result.pageData
				);
			}
		)
	);
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	homeRoutes
};
