'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const http = require('http');
const io = require('socket.io');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const socketIoListeners = require('@serverRoot/listeners/socketIoListeners');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia um novo servidor socket.io
const startIo = () => {
	try {
		const ioOptions = {
			path: __serverConfig.socketIo.path
		};

		const _server = http.createServer((req, res) => {
			if (req.method === 'GET') {
				if (req.url !== '/favicon.ico') {
					res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
					res.write(`Servidor socket.io está rodando em ${ios.httpServer.address().address}:${ios.httpServer.address().port}...`);
				} else {
					res.writeHead(200, { 'Content-Type': 'image/x-icon' });
				}
			}

			res.end();
		});

		const ios = io(ioOptions).attach(_server);
		const listeners = socketIoListeners.listeners;

		let listeningMethods = [];

		_server.listen(__serverConfig.socketIo.serverPort, __serverConfig.socketIo.serverHost);

		// Listeners aqui
		if (listeners) {
			Object.keys(listeners).forEach(
				l => {
					listeners[l](ios);
					listeningMethods.push(l);
				}
			);
		}

		ios.httpServer.once('listening', () => {
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

			log.logger('info', `Servidor socket.io está rodando em ${ios.httpServer.address().address}:${ios.httpServer.address().port}...${showMessageComplement(listeningMethods)}\r\n`, 'startUp');
		});
	} catch(err) {
		log.logger('error', err.stack || err, 'startUp');
	}
};
// -------------------------------------------------------------------------

module.exports = {
	startIo
};
