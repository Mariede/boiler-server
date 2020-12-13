'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Calcula o tempo de resposta de uma rota em um controller, exibe dados da rota
const showDetails = (req, res) => {
	const start = Date.now();
	const logDisplay = (__serverConfig.server.saveRouteLogs ? 'routes' : 'consoleOnly');

	res.once(
		'finish',
		() => {
			log.logger('info', `${res.locals.routeIsProtectedRoute ? '* PROTEGIDA * ' : ''}Rota ${(res.locals.routeEscapedRoute || '')} (método: ${req.method.toUpperCase()}, status: ${res.statusCode}) solicitada por ${res.locals.ip} => em Controller ${(res.locals.routeControllerRoute || '')} (${Date.now() - start} ms)`, logDisplay);
		}
	);

	return (
		{ ip: res.locals.ip, start: start }
	);
};
// -------------------------------------------------------------------------

module.exports = {
	showDetails
};
