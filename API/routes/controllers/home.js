"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// Acoes
const home = require('@serverRoot/actions/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware para rotas aqui
const gateLocal = async (req, res) => {
	try {
		return;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasHome = (router) => {
	router.route('/')
	// root ----------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await home.root(req, res);
			res.status(200).sendFile(result, { root: __serverRoot + '/_home' });
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/login')
	// login ---------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.post(async (req, res) => {
		try {
			let result = await home.login(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/logout')
	// logout --------------------------------------------------------------
	.all(async (req, res) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);

			let result = await home.logout(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------

	router.route('/isLogged')
	// isLogged ------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await home.isLogged(req, res);
			res.status(200).json(result);
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	});
	// ---------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	rotasHome
};
