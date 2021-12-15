'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const routesPermissions = require('@serverRoot/routes/controllers/routes-permissions');

// Acoes
const user = require('@serverRoot/actions/_user/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = (req, res) => {
	res.locals.routeControllerRoute = 'USER';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const userRoutes = (router, handleErrorsController) => {
	// Colecao/Model usuario ---------------------------------------------------
	router
	.route('/usuario')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.get( // Colecao usuarios (todos)
		handleErrorsController(
			async (req, res) => {
				const result = await user.consultarTodos(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.lstUsuarios,
				routesPermissions.edtUsuarios
			]
		)
	)
	.post( // Novo usuario
		handleErrorsController(
			async (req, res) => {
				const result = await user.inserir(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.edtUsuarios
			]
		)
	);
	// -------------------------------------------------------------------------

	// Altera senha usuario ----------------------------------------------------
	router
	.route('/usuario/senha')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.put(
		handleErrorsController(
			async (req, res) => {
				const result = await user.senha(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.edtMinhaSenha
			]
		)
	);
	// -------------------------------------------------------------------------

	// Opcoes disponiveis ------------------------------------------------------
	router
	.route('/usuario/options')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.get(
		handleErrorsController(
			async (req, res) => {
				const result = await user.options(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.lstUsuarios,
				routesPermissions.edtUsuarios
			]
		)
	);
	// -------------------------------------------------------------------------

	// Model usuario -----------------------------------------------------------
	router
	.route('/usuario/:id')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.get(
		handleErrorsController(
			async (req, res) => {
				const result = await user.consultar(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.lstUsuarios,
				routesPermissions.edtUsuarios
			]
		)
	)
	.put(
		handleErrorsController(
			async (req, res) => {
				const result = await user.alterar(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.edtUsuarios
			]
		)
	)
	.delete(
		handleErrorsController(
			async (req, res) => {
				const result = await user.excluir(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.edtUsuarios
			]
		)
	);
	// -------------------------------------------------------------------------

	// Ativa/desativa usuario --------------------------------------------------
	router
	.route('/usuario/:id/ativacao')
	.all(
		handleErrorsController(
			(req, res, next) => {
				_commonGate(req, res);
				next();
			}
		)
	)
	.put(
		handleErrorsController(
			async (req, res) => {
				const result = await user.ativacao(req, res);
				res.status(200).send(result);
			},
			[
				routesPermissions.edtUsuarios
			]
		)
	);
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	userRoutes
};
