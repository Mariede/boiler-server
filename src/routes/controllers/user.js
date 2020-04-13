'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const user = require('@serverRoot/actions/user');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware
const _commonGate = async (req, res) => {
	res.locals.routeControllerRoute = 'USER';
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Rotas
const userRoutes = (router, handleErrorsController) => {
	// Colecao usuarios ----------------------------------------------------
	router.route('/usuario')
	.all (
		handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.get (
		handleErrorsController (
			async (req, res) => {
				let result = await user.consultarTodos(req, res);
				res.status(200).send(result);
			}
		)
	);
	// ---------------------------------------------------------------------

	// Model usuario -------------------------------------------------------
	router.route('/usuario/:id')
	.all (
		handleErrorsController (
			async (req, res, next) => {
				await _commonGate(req, res);
				next();
			}
		)
	)
	.get (
		handleErrorsController (
			async (req, res) => {
				let result = await user.consultar(req, res);
				res.status(200).send(result);
			}
		)
	)
	.post (
		handleErrorsController (
			async (req, res) => {
				let result = await user.inserir(req, res);
				res.status(200).send(result);
			}
		)
	)
	.put (
		handleErrorsController (
			async (req, res) => {
				let result = await user.alterar(req, res);
				res.status(200).send(result);
			}
		)
	)
	.delete (
		handleErrorsController (
			async (req, res) => {
				let result = await user.excluir(req, res);
				res.status(200).send(result);
			}
		)
	);
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	userRoutes
};
