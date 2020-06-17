'use strict';

// -------------------------------------------------------------------------
// Rotas (controllers)
const auth = require('@serverRoot/routes/controllers/auth');
const home = require('@serverRoot/routes/controllers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Controllers com as rotas da aplicacao
const startRoutes = (router, handleErrorsController) => {
	auth.authRoutes(router, handleErrorsController);
	home.homeRoutes(router, handleErrorsController);
};
// -------------------------------------------------------------------------

module.exports = {
	startRoutes
};
