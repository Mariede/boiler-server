'use strict';

// -------------------------------------------------------------------------
// Rotas (controllers)
const auth = require('@serverRoot/routes/controllers/_base/auth');
const home = require('@serverRoot/routes/controllers/_base/home');
const user = require('@serverRoot/routes/controllers/_user/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Controllers com as rotas da aplicacao
const startRoutes = (router, handleErrorsController) => {
	auth.authRoutes(router, handleErrorsController);
	home.homeRoutes(router, handleErrorsController);
	user.userRoutes(router, handleErrorsController);
};
// -------------------------------------------------------------------------

module.exports = {
	startRoutes
};
