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

		if (!redirectHttpToHttpsPort) {
			resolve(-1);
		} else {
			if (isNaN(parseFloat(redirectHttpToHttpsPort)) || !Number.isInteger(redirectHttpToHttpsPort) || redirectHttpToHttpsPort < 0) {
				resolve(-2);
			} else {
				const pServerCheck = {
					protocol: http,
					serverOptions: {},
					httpsRedirectUrl: `https://${webServerHost}${(webServerPort === 443 ? '' : `:${webServerPort}`)}`
				};

				const listenOptions = {
					port: redirectHttpToHttpsPort,
					host: webServerHost,
					backlog: __serverConfig.server.backlog
				};

				const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, (req, res) => {
					const redirectUrl = pServerCheck.httpsRedirectUrl + (req.url ? req.url : '');

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
						resolve(redirectHttpToHttpsPort);
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
