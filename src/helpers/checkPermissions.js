'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Verifica se o usuario logado tem permissao de acesso a rota (controller)
	-> allowedPermissions: Identificadores das permissoes permitidas, em formato de array

	** Validacao case insensitive
*/
const validate = (req, allowedPermissions) => {
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;

	const userPermissions = Object.prototype.hasOwnProperty.call(sess, sessWraper) && sess[sessWraper].funcoes;

	// Se string: para maiusculo na validacao
	const _allowedPermissions = (
		Array.isArray(allowedPermissions) ? (
			allowedPermissions.map(
				_p => {
					return (
						(typeof _p === 'string' ? _p.toUpperCase() : _p)
					);
				}
			)
		) : (
			[]
		)
	);

	const _userPermissions = (
		Array.isArray(userPermissions) ? (
			userPermissions.map(
				_p => {
					return (
						(typeof _p === 'string' ? _p.toUpperCase() : _p)
					);
				}
			)
		) : (
			[]
		)
	);

	// Valida permissao
	const permitted = _allowedPermissions.some(
		_p => {
			return (
				_userPermissions.includes(_p)
			);
		}
	);

	return permitted;
};
// -------------------------------------------------------------------------

module.exports = {
	validate
};
