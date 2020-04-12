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
	auth.authRoutes(router);
	home.homeRoutes(router);
	user.userRoutes(router);
};
// -------------------------------------------------------------------------

module.exports = {
	startRoutes
};
