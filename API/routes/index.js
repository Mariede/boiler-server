'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const router = express.Router();
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
// Middleware para todas as rotas existentes e nao existentes
router.use(async (req, res, next) => {
	try {
		let rota = req.url.match('^[^?]*')[0].replace(/[/]+$/, '') + '/',
			ip = req.headers['x-forwarded-for'] ||
					req.connection.remoteAddress ||
					req.socket.remoteAddress ||
					(req.connection.socket ? req.connection.socket.remoteAddress : null),
			method = req.method,
			isProtected = await helpersAuth.isProtected(rota),
			segueFluxo = false;

		log.logger('info', `${isProtected ? '* PROTEGIDA * ' : ''}Rota ${rota} (${method.toUpperCase()}) requisitada por ${ip}`, 'consoleOnly');

		if (!isProtected) {
			segueFluxo = true;
		} else {
			if (await helpersAuth.isLogged(req, 1)) {
				segueFluxo = true;
			}
		}

		if (segueFluxo) {
			next();
		} else {
			res.status(401).send('Rota protegida, acesso não autorizado');
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
