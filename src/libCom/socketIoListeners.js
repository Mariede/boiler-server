'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Listeners para socket.io separados por rota ou funcao
const listeners = {
	ioRootListening: io => { // Listeners para Home do servidor
		const ioChannel = io.of(nameSpaces.ioRootNameSpace);
		ioChannel.on('connection', socket => {
			let rootServerTime = null;

			socket.once('serverTimeStart', () => {
				rootServerTime = setInterval(() => {
					ioChannel.to(socket.id).emit('serverTimeTick', functions.getDateNow(true));
				}, 1000);
			});

			socket.once('disconnect', () => {
				clearInterval(rootServerTime);
			});
		});
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
