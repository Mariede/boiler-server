'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const router = express.Router();
const routeProfiler = require('@serverRoot/server/routeProfiler');
const log = require('@serverRoot/helpers/log');
const helpersAuth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers)
const auth = require('@serverRoot/routes/controllers/auth');
const home = require('@serverRoot/routes/controllers/home');
const user = require('@serverRoot/routes/controllers/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware (rotas existentes e nao existentes)
router.use(async (req, res, next) => {
	try {
		await routeProfiler.showDetails(req, res);

		let route = req.originalUrl.match('^[^?]*')[0].replace(/\/+$/, '') + '/',
			isProtected = await helpersAuth.isProtected(route),
			releasedReq = false;

		if (!isProtected) {
			releasedReq = true;
		} else {
			if (await helpersAuth.isLogged(req, 0)) {
				releasedReq = true;
			}
		}

		res.locals.routeEscapedRoute = route;
		res.locals.routeIsProtectedRoute = isProtected;
		res.locals.routeControllerRoute = 'HUB';

		if (releasedReq) {
			next();
		} else {
			res.status(401).send ({
				name: 'ROUTER',
				code: 401,
				message: 'Rota protegida, acesso não autorizado...'
			});
		}
	} catch (err) {
		log.controllerError(res, err, 'error');
	}
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers) - chamadas
auth.authRoutes(router);
home.homeRoutes(router);
user.userRoutes(router);
// ---------------------------------------------------------------------------------------------------------------

module.exports = router;
