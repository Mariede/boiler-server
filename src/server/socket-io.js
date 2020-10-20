'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const http = require('http');
const https = require('https');
const io = require('socket.io');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const log = require('@serverRoot/helpers/log');
const socketIoListeners = require('@serverRoot/lib-com/socket-io-listeners');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia um novo servidor socket.io
const startIo = cert => {
	return new Promise((resolve, reject) => {
		const isHttps = __serverConfig.server.secure.isHttps;

		const pServerCheck = {
			protocol: (isHttps ? https : http),
			serverOptions: (isHttps ? {
				key: cert.key,
				cert: cert.public
			} : {}),
			protocolInfo: (isHttps ? 'https://' : 'http://')
		};

		const listenOptions = {
			port: __serverConfig.socketIo.serverPort,
			host: (__serverConfig.socketIo.serverHost !== '' ? __serverConfig.socketIo.serverHost : '0.0.0.0'),
			backlog: __serverConfig.server.backlog
		};

		const ioOptions = {
			path: __serverConfig.socketIo.path
		};

		// Cria servidor socket.io -------------------------------------------------
		const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, (req, res) => {
			if (req.method.toUpperCase() === 'GET') {
				if (req.url !== '/favicon.ico') {
					res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
					res.write(`Servidor socket.io está rodando em ${pServerCheck.protocolInfo}${ios.httpServer.address().address}:${ios.httpServer.address().port}...`);
				} else {
					res.writeHead(200, { 'Content-Type': 'image/x-icon' });
				}
			}

			res.end();
		});

		_server.maxConnections = __serverConfig.server.maxConnections;
		_server.timeout = __serverConfig.server.timeout * 1000;
		_server.keepAliveTimeout = __serverConfig.server.keepAliveTimeout * 1000;
		_server.maxHeadersCount = __serverConfig.server.maxHeadersCount;
		_server.headersTimeout = __serverConfig.server.headersTimeout * 1000;

		// -------------------------------------------------------------------------
		// Inicia servidor socket.io
		const ios = io(ioOptions).attach(_server);
		const listeners = socketIoListeners.listeners;
		const listeningMethods = [];

		_server.listen(listenOptions).on(
			'error',
			err => {
				log.logger('error', `[socket.io-servidor] ${(err.stack || err)}`);
			}
		);

		// Listeners aqui
		if (listeners) {
			Object.keys(listeners).forEach(
				l => {
					listeners[l](ios);
					listeningMethods.push(l);
				}
			);
		}

		ios.httpServer.once(
			'listening',
			() => {
				try {
					const showMessageComplement = lm => {
						let messageComplement = '';

						if (lm.length) {
							messageComplement = ' (listeners ativos:';

							lm.forEach(
								l => {
									messageComplement += ` ${l}`;
								}
							);

							messageComplement += ')';
						} else {
							messageComplement = ' (nenhum listener ativo)';
						}

						return messageComplement;
					};

					log.logger('info', `Servidor socket.io está rodando em ${pServerCheck.protocolInfo}${ios.httpServer.address().address}:${ios.httpServer.address().port}...${showMessageComplement(listeningMethods)}\r\n`, 'startUp');

					resolve();
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};
// -------------------------------------------------------------------------

module.exports = {
	startIo
};
