'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
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
	const ios = io.listen(__serverConfig.socketIo.serverPort);
	const listeners = socketIoListeners.listeners;

	let listeningMethods = [];

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

		log.logger('info', `Servidor socket.io está rodando na porta ${ios.httpServer.address().port}...${showMessageComplement(listeningMethods)}`, 'startUp');
	});
};
// -------------------------------------------------------------------------

module.exports = {
	startIo
};
