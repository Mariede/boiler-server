'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const http = require('http');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia um novo servidor apenas para redirecionamento http => https, se necessario
const startRedirectHttpToHttps = (webServerHost, webServerPort) => {
	return new Promise((resolve, reject) => {
		const redirectHttpToHttpsPort = __serverConfig.server.secure.redirectHttpToHttpsPort;
		const portHttp = Array.isArray(redirectHttpToHttpsPort) ? redirectHttpToHttpsPort[0] : redirectHttpToHttpsPort;
		const portHttps = Array.isArray(redirectHttpToHttpsPort) ? redirectHttpToHttpsPort[1] : webServerPort;

		if (!portHttp || !portHttps) {
			resolve(-1);
		} else {
			if (!Number.isInteger(portHttp) || portHttp < 0 || !Number.isInteger(portHttps) || portHttps < 0) {
				resolve(-2);
			} else {
				const pServerCheck = {
					protocol: http,
					serverOptions: {}
				};

				const listenOptions = {
					port: portHttp,
					host: webServerHost,
					backlog: __serverConfig.server.backlog
				};

				// Cria servidor de redirect -----------------------------------------------
				const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, (req, res) => {
					const redirectUrl = `https://${String(req.headers.host || '').split(':')[0]}${(portHttps === 443 ? '' : `:${portHttps}`)}${req.url ? req.url : ''}`;

					if (req.method.toUpperCase() === 'GET') {
						res.writeHead(301, { Location: redirectUrl });
					} else {
						res.writeHead(308, { Location: redirectUrl });
					}

					res.end();
				});

				_server.maxConnections = __serverConfig.server.maxConnections;
				_server.timeout = __serverConfig.server.timeout * 1000;
				_server.keepAliveTimeout = __serverConfig.server.keepAliveTimeout * 1000;
				_server.maxHeadersCount = __serverConfig.server.maxHeadersCount;
				_server.headersTimeout = __serverConfig.server.headersTimeout * 1000;

				// -------------------------------------------------------------------------
				// Inicia servidor de redirect
				const serverStarter = () => {
					try {
						resolve(portHttp);
					} catch (err) {
						reject(err);
					}
				};

				_server.listen(listenOptions, serverStarter()).on(
					'error',
					err => {
						log.logger('error', `[redirect-servidor] ${(err.stack || err)}`);
					}
				);
			}
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	startRedirectHttpToHttps
};
