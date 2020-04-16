'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const router = express.Router();
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers)
const routeProfiler = require('@serverRoot/server/routeProfiler');
const helpersAuth = require('@serverRoot/helpers/auth');
const routes = require('@serverRoot/routes/routes');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware (rotas existentes e nao existentes)
router.use(async (req, res, next) => {
	try {
		const checkIsProtected = route => { // Verifica se a rota e protegida com base nas informacoes de config
			const exceptInspect = (paramTable, paramRoute) => {
				const routePrefix = (__serverConfig.server.routePrefix || '').replace(/\/+$/, '') + '/';

				return paramTable.some (
					element => {
						let elementPick = element.trim().toUpperCase().replace(/^\/+|\/+$/, ''),
							elementCheck = routePrefix + (elementPick !== '' ? elementPick + '/' : ''),
							regExCheck = new RegExp(elementCheck);

						return (elementCheck === routePrefix ? (elementCheck === paramRoute) : regExCheck.test(paramRoute));
					}
				);
			};

			let routeCheck = route.toUpperCase(),
				authTipo = __serverConfig.auth.authTipo,
				exceptTable = __serverConfig.auth.except,
				exceptReturn = exceptInspect(exceptTable, routeCheck),
				fRet = true; // Rota protegida inicialmente

			if (authTipo === 2) {
				if (!exceptReturn) {
					fRet = false;
				}
			} else {
				if (exceptReturn) {
					fRet = false;
				}
			}

			return fRet;
		};

		const controllersRoutes = () => {
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

			routes.startRoutes(router, handleErrorsController);
			next();
		};

		routeProfiler.showDetails(req, res);

		let route = req.originalUrl.match('^[^?]*')[0].replace(/\/+$/, '') + '/',
			isProtected = checkIsProtected(route),
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
			controllersRoutes();
		} else {
			res.status(401).send ({
				name: 'ROUTER',
				code: 401,
				message: 'Rota protegida, acesso não autorizado...'
			});
		}
	} catch (err) {
		next(err);
	}
});
// -------------------------------------------------------------------------

module.exports = router;
