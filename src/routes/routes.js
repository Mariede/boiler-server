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
const usuario = require('@serverRoot/routes/controllers/usuario');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware (rotas existentes e nao existentes)
router.use(async (req, res, next) => {
	try {
		await routeProfiler.showDetails(req, res);

		let rota = req.originalUrl.match('^[^?]*')[0].replace(/\/+$/, '') + '/',
			isProtected = await helpersAuth.isProtected(rota),
			segueFluxo = false;

		if (!isProtected) {
			segueFluxo = true;
		} else {
			if (await helpersAuth.isLogged(req, 'a')) {
				segueFluxo = true;
			}
		}

		res.locals.routeEscapedRoute = rota;
		res.locals.routeIsProtectedRoute = isProtected;
		res.locals.routeControllerRoute = 'HUB';

		if (segueFluxo) {
			next();
		} else {
			res.status(401).send({
				name: 'ROUTER',
				code: 401,
				message: 'Rota protegida, acesso não autorizado...'
			});
		}
	} catch(err) {
		log.controllerErro(res, err, 'error');
	}
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers) - chamadas
auth.rotasAuth(router);
home.rotasHome(router);
usuario.rotasUsuario(router);
// ---------------------------------------------------------------------------------------------------------------

module.exports = router;
