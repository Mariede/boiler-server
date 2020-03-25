'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const home = require('@serverRoot/actions/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = async (req, res) => {
	try {
		res.locals.routeControllerRoute = 'HOME';
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const homeRoutes = router => {
	// Rota: root ----------------------------------------------------------
	router.route('/')
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
			let result = await home.root(req, res);
			res.status(200).render(result.path + result.file, result.pageData);
		} catch(err) {
			log.controllerError(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	homeRoutes
};
