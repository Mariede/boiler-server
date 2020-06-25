'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Listeners para socket.io separados por rota ou funcao
const listeners = {
	ioRootListening: io => { // Listeners para Home do servidor
		const ioChannel = io.of(nameSpaces.ioRootNameSpace);
		ioChannel.on(
			'connection',
			socket => {
				let rootServerTime = null;

				socket.on(
					'serverTimeStart',
					() => {
						rootServerTime = setInterval(() => {
							try {
								ioChannel.to(socket.id).emit('serverTimeTick', functions.getDateNow(true));
							} catch (err) {
								log.logger('error', `[socket.io-servidor] ${(err.stack || err)}`);
								clearInterval(rootServerTime);
							}
						}, 1000);
					}
				);

				socket.on(
					'disconnect',
					() => {
						clearInterval(rootServerTime);
					}
				);
			}
		);
	}
};

// Namespaces dos listeners (caminhos para conexao)
const nameSpaces = {
	ioRootNameSpace: '/home.io'
};
// -------------------------------------------------------------------------

module.exports = {
	listeners,
	nameSpaces
};
