'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const checkPermissions = require('@serverRoot/helpers/check-permissions');
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
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.lstUsuarios,
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.consultarTodos(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
		)
	)
	.post( // Novo usuario
		handleErrorsController(
			async (req, res) => {
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.inserir(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
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
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.edtMinhaSenha
						]
					)
				) {
					const result = await user.senha(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
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
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.lstUsuarios,
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.options(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
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
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.lstUsuarios,
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.consultar(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
		)
	)
	.put(
		handleErrorsController(
			async (req, res) => {
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.alterar(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
		)
	)
	.delete(
		handleErrorsController(
			async (req, res) => {
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.excluir(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
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
				if (
					checkPermissions.validate(
						req,
						[
							routesPermissions.edtUsuarios
						]
					)
				) {
					const result = await user.ativacao(req, res);
					res.status(200).send(result);
				} else {
					res.status(401).send(
						{
							name: res.locals.routeControllerRoute,
							code: 401,
							message: 'Rota protegida, permissão negada...'
						}
					);
				}
			}
		)
	);
	// -------------------------------------------------------------------------
};
// -------------------------------------------------------------------------

module.exports = {
	userRoutes
};
