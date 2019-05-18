'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const router = express.Router();
const log = require('@serverRoot/helpers/log');
const auth = require('@serverRoot/helpers/auth');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers)
const home = require('@serverRoot/routes/controllers/home');
const usuario = require('@serverRoot/routes/controllers/usuarios/usuario');
const produto = require('@serverRoot/routes/controllers/produtos/produto');
const venda = require('@serverRoot/routes/controllers/vendas/venda');
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
			metodo = req.method,
			isProtected = await auth.isProtected(rota),
			segueFluxo = false;

		log.logger('info', `${isProtected ? '* PROTEGIDA * ' : ''}Rota ${rota} (${metodo}) requisitada por ${ip}`, 'consoleOnly');

		if (!isProtected) {
			segueFluxo = true;
		} else {
			if (await auth.isLogged(req, 1)) {
				segueFluxo = true;
			}
		}

		if (segueFluxo) {
			next();
		} else {
			res.status(401).json('Rota protegida, acesso não autorizado');
		}
	} catch(err) {
		log.controllerErro(res, err, 'error');
	}
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas (controllers) - chamadas
home.rotasHome(router);
usuario.rotasUsuario(router);
produto.rotasProduto(router);
venda.rotasVenda(router);
// ---------------------------------------------------------------------------------------------------------------

module.exports = router;
