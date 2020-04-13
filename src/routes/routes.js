'use strict';

// -------------------------------------------------------------------------
// Rotas (controllers)
const auth = require('@serverRoot/routes/controllers/auth');
const home = require('@serverRoot/routes/controllers/home');
const user = require('@serverRoot/routes/controllers/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Controllers com as rotas da aplicacao
const startRoutes = router => {
	const handleErrorsController = fn => { // Wrapper para handler de erros dos controllers
		return (
			async (req, res, next) => {
				try {
					await fn(req, res, next);
				} catch (err) {
					next(err); // Sobe erro para topo do middleware
				}
			}
		);
	};

	// Controllers personalizados
	auth.authRoutes(router, handleErrorsController);
	home.homeRoutes(router, handleErrorsController);
	user.userRoutes(router, handleErrorsController);
};
// -------------------------------------------------------------------------

module.exports = {
	startRoutes
};
