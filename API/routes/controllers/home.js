'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const home = require('@serverRoot/actions/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware para rotas aqui
const _gateLocal = async (req, res) => {
	try {
		log.logger('info', '=> em Controller HOME', 'consoleOnly');
		return;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const rotasHome = router => {
	router.route('/')
	// root ----------------------------------------------------------------
	.all(async (req, res, next) => {
	// Todos os verbos
		try {
			await _gateLocal(req, res);
			next();
		} catch(err) {
			log.controllerErro(res, err, 'error');
		}
	})
	.get(async (req, res) => {
		try {
			let result = await home.root(req, res);
			res.status(200).render(result.path + result.file, { data: result.data });
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
